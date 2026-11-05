-- Home page banners: pictures or short videos (businesses, announcements) that slide
-- after the Liky brand slide. Managed from the back office.
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  title text,
  link_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table banners enable row level security;
revoke all on banners from anon, authenticated;
grant select on banners to anon, authenticated;
grant insert, update, delete on banners to authenticated;

drop policy if exists "published banners readable" on banners;
create policy "published banners readable" on banners for select
  using (is_published or is_admin());
drop policy if exists "admins manage banners" on banners;
create policy "admins manage banners" on banners for all
  using (is_admin()) with check (is_admin());

drop trigger if exists banners_audit on banners;
create trigger banners_audit after insert or update or delete on banners
  for each row execute function audit_content_change();

-- The media bucket also takes short videos now (up to 25MB).
do $$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema not found, skipping media bucket update';
    return;
  end if;
  update storage.buckets
     set file_size_limit = 26214400,
         allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
   where id = 'media';
end;
$$;
