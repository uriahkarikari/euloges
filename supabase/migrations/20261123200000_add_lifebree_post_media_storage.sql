-- Public post media is intended for posts explicitly marked public.
-- Upload, update and delete remain restricted to each authenticated user's folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lifebree-post-media', 'lifebree-post-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload their Lifebree post media"
on storage.objects for insert to authenticated
with check (bucket_id = 'lifebree-post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users replace their Lifebree post media"
on storage.objects for update to authenticated
using (bucket_id = 'lifebree-post-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'lifebree-post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete their Lifebree post media"
on storage.objects for delete to authenticated
using (bucket_id = 'lifebree-post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
