import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
const normalizeNip = (value: unknown) => String(value ?? "").replace(/\D/g, "");
const validNip = (nip: string) => {
  if (nip.length !== 10) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const checksum = weights.reduce((sum, weight, index) => sum + weight * Number(nip[index]), 0) % 11;
  return checksum < 10 && checksum === Number(nip[9]);
};
const allowedAmberColors = new Set(["Mix kolor", "Cytryna", "Koniak jasny/ciemny", "Wiśnia"]);
const normalizeItemColors = (item: { colors?: unknown[] }, quantity: number) => {
  const colors = Array.isArray(item.colors) ? item.colors.map(color => String(color || "").trim()).slice(0, quantity) : [];
  if (colors.length !== quantity || colors.some(color => !allowedAmberColors.has(color))) throw new Error("Wybierz kolor bursztynu dla każdej sztuki w koszyku");
  return colors;
};

serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { customer, items, shippingMethodId, language } = await req.json();
    if (!customer?.email || !customer?.name || !customer?.address || !Array.isArray(items) || !items.length) throw new Error("Niepełne zamówienie");
    const documentType = customer.document_type === "invoice" ? "invoice" : "receipt";
    const taxId = normalizeNip(customer.tax_id);
    if (documentType === "invoice" && (!customer.invoice_name || !customer.invoice_address || !validNip(taxId))) throw new Error("Uzupełnij prawidłowe dane do faktury VAT");
    const safeCustomer = { name: String(customer.name), email: String(customer.email), phone: String(customer.phone || ""), address: String(customer.address), notes: String(customer.notes || ""), inpost_point_name: String(customer.inpost_point_name || ""), inpost_point_address: String(customer.inpost_point_address || ""), document_type: documentType, invoice_name: documentType === "invoice" ? String(customer.invoice_name) : "", tax_id: documentType === "invoice" ? taxId : "", invoice_address: documentType === "invoice" ? String(customer.invoice_address) : "" };
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ids = [...new Set(items.map((item: { id: string }) => String(item.id)))];
    const { data: products, error: productsError } = await supabase.from("products").select("id,name_pl,name_en,price,active").in("id", ids).eq("active", true);
    if (productsError) throw productsError;
    const productMap = new Map((products || []).map(product => [product.id, product]));
    const normalized = items.map((item: { id: string; qty: number; colors?: unknown[] }) => {
      const product = productMap.get(String(item.id));if (!product) throw new Error("Produkt jest niedostępny");
      const quantity = Math.max(1, Math.min(20, Number(item.qty) || 1));
      return { id: product.id, name: language === "en" ? (product.name_en || product.name_pl) : product.name_pl, quantity, colors: normalizeItemColors(item, quantity), price: Math.round(Number(product.price) * 100) };
    });
    const { data: shipping, error: shippingError } = await supabase.from("shipping_methods").select("id,name_pl,name_en,price_cents,active").eq("id", String(shippingMethodId)).eq("active", true).single();
    if (shippingError || !shipping) throw new Error("Wybrana metoda dostawy jest niedostępna");
    if (shipping.id === "inpost-paczkomat" && !String(customer.inpost_point_name || "").trim()) throw new Error("Wybierz Paczkomat InPost");
    const shippingName = language === "en" ? shipping.name_en : shipping.name_pl;
    const productsTotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = productsTotal >= 30000 ? 0 : shipping.price_cents;
    const shippingMethod = { id: shipping.id, name: shippingName, name_pl: shipping.name_pl, name_en: shipping.name_en, price_cents: shippingCost };
    const total = productsTotal + shippingCost;
    const { data: order, error: orderError } = await supabase.from("orders").insert({ customer: safeCustomer, items: normalized, shipping_method: shippingMethod, shipping_cost: shippingCost, total, status: "awaiting_transfer" }).select("id").single();
    if (orderError || !order) throw orderError || new Error("Nie udało się zapisać zamówienia");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const ownerEmail = Deno.env.get("OWNER_EMAIL") || "biuroamberflo@gmail.com";
      const fromEmail = Deno.env.get("FROM_EMAIL") || "Amberflo <onboarding@resend.dev>";
      const sendCustomerEmails = Deno.env.get("SEND_CUSTOMER_EMAILS") === "true";
      const productsHtml = normalized.map(item => `<li>${esc(item.name)} × ${item.quantity} — ${(item.price * item.quantity / 100).toFixed(2)} zł<br><small>${item.colors.map((color, index) => `Sztuka ${index + 1}: ${esc(color)}`).join("<br>")}</small></li>`).join("");
      const pointHtml = safeCustomer.inpost_point_name ? `<p><b>Paczkomat:</b> ${esc(safeCustomer.inpost_point_name)}<br>${esc(safeCustomer.inpost_point_address)}</p>` : "";
      const documentHtml = safeCustomer.document_type === "invoice" ? `<p><b>Dokument:</b> Faktura VAT<br><b>Nabywca:</b> ${esc(safeCustomer.invoice_name)}<br><b>NIP:</b> ${esc(safeCustomer.tax_id)}<br><b>Adres do faktury:</b><br>${esc(safeCustomer.invoice_address).replace(/\n/g, "<br>")}</p>` : `<p><b>Dokument:</b> Paragon</p>`;
      const orderShort = String(order.id).slice(0, 8).toUpperCase();
      const commonHtml = `<p><b>Numer zamówienia:</b> #${orderShort}</p><ul>${productsHtml}</ul><p><b>Dostawa:</b> ${esc(shippingName)} — ${(shippingCost / 100).toFixed(2)} zł</p>${pointHtml}<h2>Razem: ${(total / 100).toFixed(2)} zł</h2>`;
      const cancellationSubject = `Prośba o anulowanie zamówienia Amberflo #${orderShort}`;
      const cancellationUrl = `mailto:biuroamberflo@gmail.com?subject=${encodeURIComponent(cancellationSubject)}&body=${encodeURIComponent(`Proszę o anulowanie zamówienia #${orderShort}.\n\nImię i nazwisko: ${safeCustomer.name}\nE-mail użyty w zamówieniu: ${safeCustomer.email}`)}`;
      const cancellationBlock = `<hr style="margin:28px 0;border:0;border-top:1px solid #ead8c4"><p><b>Chcesz anulować zamówienie?</b><br>Wyślij prośbę możliwie szybko. Jeżeli zamówienie zostało już wysłane, anulowanie może nie być możliwe.</p><p><a href="${esc(cancellationUrl)}" style="display:inline-block;padding:12px 18px;background:#241914;color:#fff;text-decoration:none">Poproś o anulowanie zamówienia</a></p>`;
      const messages = [{ key: "owner", to: ownerEmail, subject: `Nowe zamówienie Amberflo — ${safeCustomer.name}`, html: `<h1>Nowe zamówienie — przelew tradycyjny</h1>${commonHtml}<p><b>Klient:</b> ${esc(safeCustomer.name)}<br><b>Telefon:</b> ${esc(safeCustomer.phone)}<br><b>E-mail:</b> ${esc(safeCustomer.email)}</p><p><b>Adres:</b><br>${esc(safeCustomer.address).replace(/\n/g, "<br>")}</p>${documentHtml}` }];
      if (sendCustomerEmails) messages.push({ key: "customer", to: safeCustomer.email, subject: `Przyjęliśmy zamówienie Amberflo #${orderShort}`, html: `<h1>Dziękujemy za zamówienie!</h1><p>Wybrano przelew tradycyjny. Zamówienie rozpoczniemy realizować po zaksięgowaniu płatności.</p>${commonHtml}<p><b>Dane do przelewu:</b><br>mBank<br>92 1140 2004 0000 3102 7968 1765<br><b>Tytuł:</b> Zamówienie #${orderShort}</p>${cancellationBlock}` });
      for (const message of messages) {
        const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `amberflo-transfer-${order.id}-${message.key}` }, body: JSON.stringify({ from: fromEmail, to: [message.to], reply_to: ownerEmail, subject: message.subject, html: message.html }) });
        if (!response.ok) console.error("Resend:", await response.text());
      }
    }
    return new Response(JSON.stringify({ orderId: order.id, total }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
