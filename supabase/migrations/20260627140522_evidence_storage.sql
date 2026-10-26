insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence',
  'evidence',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Evidence owners can upload files" on storage.objects;
create policy "Evidence owners can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Evidence owners can view files" on storage.objects;
create policy "Evidence owners can view files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Evidence owners can update files" on storage.objects;
create policy "Evidence owners can update files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Evidence owners can delete files" on storage.objects;
create policy "Evidence owners can delete files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
