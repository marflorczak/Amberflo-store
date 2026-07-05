import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
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
      const product = productMap.get(String(item.id));
      if (!product) throw new Error("Produkt jest niedostępny");
      return { id: product.id, name: language === "en" ? (product.name_en || product.name_pl) : product.name_pl, quantity: Math.max(1, Math.min(20, Number(item.qty) || 1)), price: Math.round(Number(product.price) * 100) };
    });

    const { data: shipping, error: shippingError } = await supabase.from("shipping_methods").select("id,name_pl,name_en,price_cents,active").eq("id", String(shippingMethodId)).eq("active", true).single();
    if (shippingError || !shipping) throw new Error("Wybrana metoda dostawy jest niedostępna");
    if (shipping.id === "inpost-paczkomat" && !String(customer.inpost_point_name || "").trim()) throw new Error("Wybierz Paczkomat InPost");
    const shippingName = language === "en" ? shipping.name_en : shipping.name_pl;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Płatności Stripe nie zostały jeszcze skonfigurowane");
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const siteUrl = (Deno.env.get("SITE_URL") || req.headers.get("origin") || "http://localhost:8000").replace(/\/+$/, "");
    const productsTotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = productsTotal >= 30000 ? 0 : shipping.price_cents;
    const lineItems = normalized.map(item => ({ quantity: item.quantity, price_data: { currency: "pln", unit_amount: item.price, product_data: { name: item.name } } }));
    if (shippingCost > 0) lineItems.push({ quantity: 1, price_data: { currency: "pln", unit_amount: shippingCost, product_data: { name: `${language === "en" ? "Shipping" : "Dostawa"}: ${shippingName}` } } });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: String(customer.email),
      locale: language === "en" ? "en" : "pl",
      line_items: lineItems,
      success_url: `${siteUrl}/?payment=success`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
      metadata: { customer_name: safeCustomer.name.slice(0, 200), phone: safeCustomer.phone.slice(0, 100), shipping_method: shipping.id, document_type: safeCustomer.document_type, tax_id: safeCustomer.tax_id },
    });

    const shippingMethod = { id: shipping.id, name: shippingName, name_pl: shipping.name_pl, name_en: shipping.name_en, price_cents: shippingCost };
    const total = productsTotal + shippingCost;
    const { error: orderError } = await supabase.from("orders").insert({ stripe_session_id: session.id, customer: safeCustomer, items: normalized, shipping_method: shippingMethod, shipping_cost: shippingCost, total, status: "awaiting_payment" });
    if (orderError) throw orderError;
    return new Response(JSON.stringify({ url: session.url }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
