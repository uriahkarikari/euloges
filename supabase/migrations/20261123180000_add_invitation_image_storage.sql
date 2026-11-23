-- Public event artwork for published Lifebree invitations.
-- Public reads are intentional: the image is displayed on a public invitation page.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-images',
  'invitation-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Invitation creators upload their own artwork"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'invitation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Invitation creators replace their own artwork"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'invitation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'invitation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Invitation creators remove their own artwork"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'invitation-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
