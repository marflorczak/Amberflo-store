-- Zdjęcia klientów w opiniach Amberflo.
-- Uruchom ten plik raz w Supabase: SQL Editor -> New query -> Run.

alter table public.reviews
add column if not exists images text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('review-images','review-images',true)
on conflict (id) do update set public = true;

drop policy if exists "Public review images" on storage.objects;
create policy "Public review images" on storage.objects
for select to public using (bucket_id = 'review-images');

drop policy if exists "Public upload review images" on storage.objects;
create policy "Public upload review images" on storage.objects
for insert to anon with check (bucket_id = 'review-images');

drop policy if exists "Admins delete review images" on storage.objects;
create policy "Admins delete review images" on storage.objects
for delete to authenticated using (bucket_id = 'review-images' and public.is_admin());

notify pgrst, 'reload schema';
