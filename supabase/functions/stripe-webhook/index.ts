import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

serve(async req => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing Stripe signature");
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!, undefined, cryptoProvider);
    if (event.type !== "checkout.session.completed") return new Response("ok");

    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order, error } = await supabase.from("orders").update({ status:"paid" }).eq("stripe_session_id", session.id).select().single();
    if (error || !order) throw error || new Error("Order not found");

    const ownerEmail = Deno.env.get("OWNER_EMAIL") || "biuroamberflo@gmail.com";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Amberflo <onboarding@resend.dev>";
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const sendCustomerEmails = Deno.env.get("SEND_CUSTOMER_EMAILS") === "true";
    const customer = order.customer;
    const products = order.items.map((item: {name:string;quantity:number;price:number}) => `<li>${esc(item.name)} × ${item.quantity} — ${(item.price * item.quantity / 100).toFixed(2)} zł</li>`).join("");
    const total = `${(order.total / 100).toFixed(2)} zł`;
    const common = `<p><b>Numer zamówienia:</b> ${esc(order.id)}</p><ul>${products}</ul><h2>Razem: ${total}</h2>`;
    const messages = [
      { to:[ownerEmail], subject:`Opłacone zamówienie Amberflo — ${esc(customer.name)}`, html:`<h1>Nowe opłacone zamówienie</h1>${common}<p><b>Klient:</b> ${esc(customer.name)}<br><b>Telefon:</b> ${esc(customer.phone)}<br><b>E-mail:</b> ${esc(customer.email)}</p><p><b>Adres:</b><br>${esc(customer.address).replace(/\n/g,'<br>')}</p><p><b>Uwagi:</b> ${esc(customer.notes)}</p>` },
    ];
    if (sendCustomerEmails) {
      messages.push({ to:[customer.email], subject:"Potwierdzenie zamówienia Amberflo", html:`<h1>Dziękujemy za zamówienie!</h1><p>Płatność została potwierdzona. Skontaktujemy się w sprawie realizacji i wysyłki.</p>${common}` });
    }
    for (const message of messages) {
      const response = await fetch("https://api.resend.com/emails", { method:"POST", headers:{Authorization:`Bearer ${resendKey}`,"Content-Type":"application/json"}, body:JSON.stringify({from:fromEmail,...message}) });
      if (!response.ok) throw new Error(await response.text());
    }
    return new Response("ok");
  } catch (error) {
    return new Response(error.message, { status:400 });
  }
});
