import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

serve(async req => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Brak podpisu Stripe");
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!, undefined, cryptoProvider);
    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"].includes(event.type)) return new Response("ok");
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (event.type === "checkout.session.async_payment_failed") {
      await supabase.from("orders").update({ status: "payment_failed", updated_at: new Date().toISOString() }).eq("stripe_session_id", session.id);
      return new Response("ok");
    }
    if (session.payment_status !== "paid") return new Response("ok");
    const { data: currentOrder, error: findError } = await supabase.from("orders").select("*").eq("stripe_session_id", session.id).single();
    if (findError || !currentOrder) throw findError || new Error("Nie znaleziono zamówienia");
    const { data: order, error: updateError } = await supabase.from("orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", currentOrder.id).select().single();
    if (updateError || !order) throw updateError || new Error("Nie udało się zaktualizować zamówienia");
    if (order.payment_email_sent_at) return new Response("ok");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return new Response("ok");
    const ownerEmail = Deno.env.get("OWNER_EMAIL") || "biuroamberflo@gmail.com";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Amberflo <onboarding@resend.dev>";
    const sendCustomerEmails = Deno.env.get("SEND_CUSTOMER_EMAILS") === "true";
    const customer = order.customer || {};
    const orderShort = String(order.id).slice(0, 8).toUpperCase();
    const cancellationSubject = `Prośba o anulowanie zamówienia Amberflo #${orderShort}`;
    const cancellationUrl = `mailto:biuroamberflo@gmail.com?subject=${encodeURIComponent(cancellationSubject)}&body=${encodeURIComponent(`Proszę o anulowanie zamówienia #${orderShort}.\n\nImię i nazwisko: ${customer.name || ""}\nE-mail użyty w zamówieniu: ${customer.email || ""}`)}`;
    const cancellationBlock = `<hr style="margin:28px 0;border:0;border-top:1px solid #ead8c4"><p><b>Chcesz anulować zamówienie?</b><br>Wyślij prośbę możliwie szybko. Jeżeli zamówienie zostało już wysłane, anulowanie może nie być możliwe.</p><p><a href="${esc(cancellationUrl)}" style="display:inline-block;padding:12px 18px;background:#241914;color:#fff;text-decoration:none">Poproś o anulowanie zamówienia</a></p>`;
    const products = (order.items || []).map((item: { name: string; quantity: number; price: number; colors?: string[] }) => {
      const colors = Array.isArray(item.colors) ? `<br><small>${item.colors.map((color, index) => `Sztuka ${index + 1}: ${esc(color)}`).join("<br>")}</small>` : "";
      return `<li>${esc(item.name)} × ${item.quantity} — ${(item.price * item.quantity / 100).toFixed(2)} zł${colors}</li>`;
    }).join("");
    const shipping = order.shipping_method || {};
    const point = customer.inpost_point_name ? `<p><b>Paczkomat:</b> ${esc(customer.inpost_point_name)}<br>${esc(customer.inpost_point_address)}</p>` : "";
    const document = customer.document_type === "invoice" ? `<p><b>Dokument:</b> Faktura VAT<br><b>Nabywca:</b> ${esc(customer.invoice_name)}<br><b>NIP:</b> ${esc(customer.tax_id)}<br><b>Adres do faktury:</b><br>${esc(customer.invoice_address).replace(/\n/g, "<br>")}</p>` : `<p><b>Dokument:</b> Paragon</p>`;
    const common = `<p><b>Numer zamówienia:</b> ${esc(order.id)}</p><ul>${products}</ul><p><b>Dostawa:</b> ${esc(shipping.name)} — ${(Number(order.shipping_cost || 0) / 100).toFixed(2)} zł</p>${point}<h2>Razem: ${(Number(order.total) / 100).toFixed(2)} zł</h2>`;
    const messages = [{ key: "owner", to: ownerEmail, subject: `Opłacone zamówienie Amberflo — ${customer.name}`, html: `<h1>Nowe opłacone zamówienie</h1>${common}<p><b>Klient:</b> ${esc(customer.name)}<br><b>Telefon:</b> ${esc(customer.phone)}<br><b>E-mail:</b> ${esc(customer.email)}</p><p><b>Adres:</b><br>${esc(customer.address).replace(/\n/g, "<br>")}</p>${document}<p><b>Uwagi:</b> ${esc(customer.notes)}</p>` }];
    if (sendCustomerEmails && customer.email) messages.push({ key: "customer", to: customer.email, subject: `Potwierdzenie zamówienia Amberflo #${orderShort}`, html: `<h1>Dziękujemy za zamówienie!</h1><p>Płatność została potwierdzona. Skontaktujemy się w sprawie realizacji i wysyłki.</p>${common}${cancellationBlock}` });
    for (const message of messages) {
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `amberflo-paid-${order.id}-${message.key}` }, body: JSON.stringify({ from: fromEmail, to: [message.to], reply_to: ownerEmail, subject: message.subject, html: message.html }) });
      if (!response.ok) throw new Error(await response.text());
    }
    await supabase.from("orders").update({ payment_email_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", order.id);
    return new Response("ok");
  } catch (error) {
    return new Response(error.message, { status: 400 });
  }
});
