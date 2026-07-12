import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { type, payload } = await req.json();
    if (!['review', 'order'].includes(type)) throw new Error('Invalid notification type');
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const ownerEmail = Deno.env.get("OWNER_EMAIL") || Deno.env.get("NOTIFICATION_EMAIL") || "biuroamberflo@gmail.com";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Amberflo <onboarding@resend.dev>";
    const siteUrl = (Deno.env.get("SITE_URL") || "https://marflorczak.github.io/Amberflo-store").replace(/\/+$/, "");
    const adminUrl = `${siteUrl}/admin.html`;
    if (!resendKey) throw new Error("Missing RESEND_API_KEY");

    const isOrder = type === 'order';
    const subject = isOrder ? `Nowe zamówienie Amberflo — ${esc(payload.name)}` : `Nowa opinia Amberflo — ${esc(payload.name)}`;
    const reviewImages = Array.isArray(payload.images) ? payload.images.filter(Boolean) : [];
    const reviewImagesHtml = reviewImages.length
      ? `<p><b>Zdjęcia:</b> ${reviewImages.length}</p><ul>${reviewImages.map((url: string, index: number) => `<li><a href="${esc(url)}">Zobacz zdjęcie ${index + 1}</a></li>`).join("")}</ul>`
      : `<p><b>Zdjęcia:</b> brak</p>`;
    const html = isOrder
      ? `<h1>Nowe zamówienie</h1><p><b>Klient:</b> ${esc(payload.name)}</p><p><b>Telefon:</b> ${esc(payload.phone)}</p><p><b>E-mail:</b> ${esc(payload.email)}</p><p><b>Adres:</b><br>${esc(payload.address).replace(/\n/g,'<br>')}</p><p><b>Uwagi:</b> ${esc(payload.notes)}</p><pre>${esc(payload.summary)}</pre><h2>Razem: ${esc(payload.total)}</h2>`
      : `<h1>Nowa opinia do zatwierdzenia</h1><p><b>Autor:</b> ${esc(payload.name)}</p><p><b>Ocena:</b> ${esc(payload.rating)}/5</p><blockquote>${esc(payload.content)}</blockquote>${reviewImagesHtml}<p><a href="${esc(adminUrl)}" style="display:inline-block;padding:12px 20px;background:#e88a0c;color:#fff;text-decoration:none">Otwórz panel opinii</a></p><p>W panelu Amberflo możesz zatwierdzić, odrzucić lub usunąć opinię.</p>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromEmail, to: [ownerEmail], subject, html }),
    });
    if (!response.ok) throw new Error(await response.text());
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
