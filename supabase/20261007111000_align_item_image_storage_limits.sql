-- Align the live item image bucket with the frontend's 5 MB validation limit.
update storage.buckets
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'item-images';

drop policy if exists "authenticated upload item images" on storage.objects;
create policy "authenticated upload item images" on storage.objects
for insert to authenticated
with check (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "public read item images" on storage.objects;
create policy "public read item images" on storage.objects
for select using (bucket_id = 'item-images');
