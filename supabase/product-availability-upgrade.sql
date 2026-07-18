-- Uruchom ten plik jeden raz w Supabase SQL Editor.
-- Dodaje edytowalną dostępność i czas realizacji do każdego produktu.

alter table public.products
  add column if not exists availability_pl text not null default 'Dostępny',
  add column if not exists availability_en text not null default 'Available',
  add column if not exists shipping_time_pl text not null default 'Wysyłka w 1–3 dni robocze',
  add column if not exists shipping_time_en text not null default 'Ships within 1–3 business days';

update public.products
set
  availability_pl = coalesce(nullif(trim(availability_pl), ''), 'Dostępny'),
  availability_en = coalesce(nullif(trim(availability_en), ''), 'Available'),
  shipping_time_pl = coalesce(nullif(trim(shipping_time_pl), ''), 'Wysyłka w 1–3 dni robocze'),
  shipping_time_en = coalesce(nullif(trim(shipping_time_en), ''), 'Ships within 1–3 business days');

notify pgrst, 'reload schema';
