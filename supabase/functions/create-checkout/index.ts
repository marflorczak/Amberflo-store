import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ceny są ustalane na serwerze. Przeglądarka przesyła tylko identyfikator i ilość.
const catalog: Record<string, { name: string; price: number }> = {
  "szyszka-12": { name: "Bursztynowa szyszka", price: 5800 },
  "drzewko-216": { name: "Drzewko 216 kamieni", price: 21800 },
  "szyszka-zlota-20": { name: "Szyszka złota", price: 26000 },
  "drzewko-klasyczne-20": { name: "Drzewko klasyczne", price: 37800 },
  "drzewko-premium-20": { name: "Drzewko Premium", price: 39800 },
  "drzewko-duze-25": { name: "Drzewko 648 kamieni", price: 59800 },
};

serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { customer, items, language } = await req.json();
    if (!customer?.email || !Array.isArray(items) || items.length === 0) throw new Error("Niepełne zamówienie");
    const normalized = items.map((item: {id:string;qty:number}) => {
      const product = catalog[item.id];
      const quantity = Math.max(1, Math.min(20, Number(item.qty) || 1));
      if (!product) throw new Error("Nieznany produkt");
      return { id:item.id, quantity, ...product };
    });
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
    const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "http://localhost:8000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer.email,
      locale: language === "en" ? "en" : "pl",
      automatic_payment_methods: { enabled: true },
      line_items: normalized.map(item => ({ quantity:item.quantity, price_data:{ currency:"pln", unit_amount:item.price, product_data:{name:item.name} } })),
      success_url: `${siteUrl}/?payment=success`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
      metadata: { customer_name: String(customer.name).slice(0, 200), phone: String(customer.phone).slice(0, 100) },
    });
    const total = normalized.reduce((sum,item)=>sum+item.price*item.quantity,0);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await supabase.from("orders").insert({ stripe_session_id:session.id, customer, items:normalized, total, status:"awaiting_payment" });
    return new Response(JSON.stringify({ url: session.url }), { headers: { ...cors, "Content-Type":"application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error:error.message }), { status:400, headers:{ ...cors, "Content-Type":"application/json" } });
  }
});
