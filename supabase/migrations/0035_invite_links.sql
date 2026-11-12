create table if not exists invite_links (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);
alter table invite_links enable row level security;
drop policy if exists "admins manage invite links" on invite_links;
create policy "admins manage invite links" on invite_links for all
  using (is_admin()) with check (is_admin());
