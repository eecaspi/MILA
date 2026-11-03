-- Image uploads for the back office (business logos/covers, offer images).
-- Public read, admin-only write. Supabase-specific: skipped automatically on a
-- plain Postgres without the storage schema (e.g. the local test database).
do $$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema not found, skipping media bucket setup';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
  on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

  execute $p$ drop policy if exists "media public read" on storage.objects $p$;
  execute $p$ create policy "media public read" on storage.objects for select
            using (bucket_id = 'media') $p$;
  execute $p$ drop policy if exists "media admin write" on storage.objects $p$;
  execute $p$ create policy "media admin write" on storage.objects for insert
            with check (bucket_id = 'media' and public.is_admin()) $p$;
  execute $p$ drop policy if exists "media admin update" on storage.objects $p$;
  execute $p$ create policy "media admin update" on storage.objects for update
            using (bucket_id = 'media' and public.is_admin()) $p$;
  execute $p$ drop policy if exists "media admin delete" on storage.objects $p$;
  execute $p$ create policy "media admin delete" on storage.objects for delete
            using (bucket_id = 'media' and public.is_admin()) $p$;
end;
$$;
