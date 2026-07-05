-- Uruchom ten plik jeden raz w Supabase SQL Editor.

create table if not exists public.shipping_methods (
  id text primary key,
  name_pl text not null,
  name_en text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.shipping_methods enable row level security;

drop policy if exists "Public can read active shipping methods" on public.shipping_methods;
create policy "Public can read active shipping methods"
on public.shipping_methods for select to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "Admins can manage shipping methods" on public.shipping_methods;
create policy "Admins can manage shipping methods"
on public.shipping_methods for all to authenticated
using (public.is_admin()) with check (public.is_admin());

insert into public.shipping_methods (id, name_pl, name_en, price_cents, active, sort_order) values
  ('inpost-paczkomat', 'InPost Paczkomat', 'InPost parcel locker', 1699, true, 10),
  ('inpost-kurier', 'InPost Kurier', 'InPost courier', 1999, true, 20),
  ('dpd-pickup', 'DPD Pickup / automat paczkowy', 'DPD Pickup / parcel locker', 1699, true, 30),
  ('dpd-kurier', 'DPD Kurier', 'DPD courier', 2199, true, 40)
on conflict (id) do nothing;

alter table public.orders add column if not exists shipping_method jsonb;
alter table public.orders add column if not exists shipping_cost integer not null default 0;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists tracking_url text;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists payment_email_sent_at timestamptz;
alter table public.orders add column if not exists updated_at timestamptz not null default now();

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
on public.orders for all to authenticated
using (public.is_admin()) with check (public.is_admin());
