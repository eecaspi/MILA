create table if not exists site_popup (
  id int primary key default 1 check (id = 1),
  is_active boolean not null default false,
  title text not null default '' check (char_length(title) <= 80),
  body text not null default '' check (char_length(body) <= 300),
  button_label text not null default '' check (char_length(button_label) <= 40),
  link_url text not null default '' check (char_length(link_url) <= 300),
  updated_at timestamptz not null default now()
);

insert into site_popup (id) values (1) on conflict (id) do nothing;

alter table site_popup enable row level security;
revoke all on site_popup from anon, authenticated;
grant select on site_popup to anon, authenticated;
grant update on site_popup to authenticated;
create policy "read active popup" on site_popup for select using (is_active or is_admin());
create policy "admins update popup" on site_popup for update using (is_admin()) with check (is_admin());
