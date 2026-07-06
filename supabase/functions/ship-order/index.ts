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

    const { orderId, trackingNumber, trackingUrl } = await req.json();
    if (!orderId || !trackingNumber || !trackingUrl) throw new Error("Podaj numer i link do śledzenia");
    try { new URL(String(trackingUrl)); } catch { throw new Error("Link do śledzenia jest nieprawidłowy"); }
    const { data: order, error: orderError } = await service.from("orders").update({ status: "shipped", tracking_number: String(trackingNumber), tracking_url: String(trackingUrl), shipped_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", String(orderId)).select().single();
    if (orderError || !order) throw orderError || new Error("Nie znaleziono zamówienia");
    const customer = order.customer || {};
    const orderShort = String(order.id).slice(0, 8).toUpperCase();
    const subject = `Twoje zamówienie Amberflo #${orderShort} zostało wysłane`;
    const text = `Dzień dobry ${customer.name || ""},\n\nTwoje zamówienie Amberflo #${orderShort} zostało wysłane.\n\nPrzewoźnik: ${order.shipping_method?.name || ""}\nNumer przesyłki: ${trackingNumber}\nŚledzenie: ${trackingUrl}\n\nDziękujemy za zakupy!\nAmberflo`;
    const html = `<h1>Twoje zamówienie jest w drodze!</h1><p>Dzień dobry ${esc(customer.name)},</p><p>Zamówienie <b>#${orderShort}</b> zostało wysłane.</p><p><b>Przewoźnik:</b> ${esc(order.shipping_method?.name)}<br><b>Numer przesyłki:</b> ${esc(trackingNumber)}</p><p><a href="${esc(trackingUrl)}" style="display:inline-block;padding:12px 20px;background:#e88a0c;color:#fff;text-decoration:none">Śledź przesyłkę</a></p><p>Dziękujemy za zakupy!<br>Amberflo</p>`;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const canEmailCustomer = Deno.env.get("SEND_CUSTOMER_EMAILS") === "true";
    let emailSent = false;
    if (resendKey && canEmailCustomer && customer.email) {
      const fromEmail = Deno.env.get("FROM_EMAIL") || "Amberflo <onboarding@resend.dev>";
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `amberflo-shipped-${order.id}` }, body: JSON.stringify({ from: fromEmail, to: [customer.email], reply_to: "biuroamberflo@gmail.com", subject, html, text }) });
      if (!response.ok) throw new Error(await response.text());emailSent = true;
    }
    const mailto = `mailto:${encodeURIComponent(customer.email || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customer.email || "")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return new Response(JSON.stringify({ ok: true, emailSent, mailto, gmailUrl }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
