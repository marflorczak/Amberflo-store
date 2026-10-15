-- Uruchom ten plik jeden raz w Supabase: SQL Editor -> New query.
-- Istniejące produkty zachowają widoczną cenę i możliwość zakupu.

alter table public.products
  add column if not exists show_price boolean not null default true,
  add column if not exists purchasable boolean not null default true;

update public.products
set
  show_price = coalesce(show_price, true),
  purchasable = coalesce(purchasable, true);
