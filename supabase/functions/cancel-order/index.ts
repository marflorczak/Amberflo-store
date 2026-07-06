import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Brak autoryzacji");
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: userData, error: userError } = await service.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Sesja administratora wygasła");
    const { data: admin } = await service.from("admin_users").select("id").eq("id", userData.user.id).maybeSingle();
    if (!admin) throw new Error("Brak uprawnień administratora");

    const { orderId, reason } = await req.json();
    if (!orderId) throw new Error("Brak identyfikatora zamówienia");
    const cleanReason = String(reason || "").trim().slice(0, 500);
    const now = new Date().toISOString();
    const { data: order, error: orderError } = await service.from("orders").update({ status: "cancelled", cancellation_reason: cleanReason || null, cancelled_at: now, updated_at: now }).eq("id", String(orderId)).select().single();
    if (orderError || !order) throw orderError || new Error("Nie znaleziono zamówienia");

    const customer = order.customer || {};
    const orderShort = String(order.id).slice(0, 8).toUpperCase();
    const reasonText = cleanReason ? `\nPowód: ${cleanReason}\n` : "";
    const reasonHtml = cleanReason ? `<p><b>Powód:</b> ${esc(cleanReason)}</p>` : "";
    const subject = `Zamówienie Amberflo #${orderShort} zostało anulowane`;
    const text = `Dzień dobry ${customer.name || ""},\n\nTwoje zamówienie Amberflo #${orderShort} zostało anulowane.${reasonText}\nJeśli zamówienie zostało opłacone, zwrot płatności zostanie przekazany tą samą metodą. Czas zaksięgowania zależy od operatora płatności i banku.\n\nW razie pytań prosimy o kontakt: biuroamberflo@gmail.com\n\nAmberflo`;
    const html = `<h1>Zamówienie zostało anulowane</h1><p>Dzień dobry ${esc(customer.name)},</p><p>Zamówienie <b>#${orderShort}</b> zostało anulowane.</p>${reasonHtml}<p>Jeśli zamówienie zostało opłacone, zwrot płatności zostanie przekazany tą samą metodą. Czas zaksięgowania zależy od operatora płatności i banku.</p><p>W razie pytań prosimy o kontakt: <a href="mailto:biuroamberflo@gmail.com">biuroamberflo@gmail.com</a></p><p>Amberflo</p>`;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const canEmailCustomer = Deno.env.get("SEND_CUSTOMER_EMAILS") === "true";
    let emailSent = false;
    if (resendKey && canEmailCustomer && customer.email) {
      const fromEmail = Deno.env.get("FROM_EMAIL") || "Amberflo <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `amberflo-cancelled-${order.id}` }, body: JSON.stringify({ from: fromEmail, to: [customer.email], reply_to: "biuroamberflo@gmail.com", subject, html, text }) });
      if (!response.ok) throw new Error(await response.text());
      emailSent = true;
      await service.from("orders").update({ cancellation_email_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", order.id);
    }
    const mailto = `mailto:${encodeURIComponent(customer.email || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customer.email || "")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return new Response(JSON.stringify({ ok: true, emailSent, mailto, gmailUrl }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
