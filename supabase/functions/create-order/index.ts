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
    const normalized = items.map((item: { id: string; qty: number }) => {
      const product = productMap.get(String(item.id));if (!product) throw new Error("Produkt jest niedostępny");
      return { id: product.id, name: language === "en" ? (product.name_en || product.name_pl) : product.name_pl, quantity: Math.max(1, Math.min(20, Number(item.qty) || 1)), price: Math.round(Number(product.price) * 100) };
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
      const productsHtml = normalized.map(item => `<li>${esc(item.name)} × ${item.quantity} — ${(item.price * item.quantity / 100).toFixed(2)} zł</li>`).join("");
      const pointHtml = safeCustomer.inpost_point_name ? `<p><b>Paczkomat:</b> ${esc(safeCustomer.inpost_point_name)}<br>${esc(safeCustomer.inpost_point_address)}</p>` : "";
      const documentHtml = safeCustomer.document_type === "invoice" ? `<p><b>Dokument:</b> Faktura VAT<br><b>Nabywca:</b> ${esc(safeCustomer.invoice_name)}<br><b>NIP:</b> ${esc(safeCustomer.tax_id)}<br><b>Adres do faktury:</b><br>${esc(safeCustomer.invoice_address).replace(/\n/g, "<br>")}</p>` : `<p><b>Dokument:</b> Paragon</p>`;
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `amberflo-transfer-${order.id}` }, body: JSON.stringify({ from: fromEmail, to: [ownerEmail], subject: `Nowe zamówienie Amberflo — ${esc(safeCustomer.name)}`, html: `<h1>Nowe zamówienie — przelew tradycyjny</h1><p><b>Numer:</b> ${order.id}</p><p><b>Klient:</b> ${esc(safeCustomer.name)}<br><b>Telefon:</b> ${esc(safeCustomer.phone)}<br><b>E-mail:</b> ${esc(safeCustomer.email)}</p><p><b>Adres:</b><br>${esc(safeCustomer.address).replace(/\n/g, "<br>")}</p>${documentHtml}${pointHtml}<p><b>Dostawa:</b> ${esc(shippingName)} — ${(shippingCost / 100).toFixed(2)} zł</p><ul>${productsHtml}</ul><h2>Razem: ${(total / 100).toFixed(2)} zł</h2>` }) });
    }
    return new Response(JSON.stringify({ orderId: order.id, total }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
