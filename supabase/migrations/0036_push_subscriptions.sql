create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique check (char_length(endpoint) between 20 and 1000),
  p256dh text not null check (char_length(p256dh) between 20 and 200),
  auth text not null check (char_length(auth) between 10 and 100),
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists "admins read push subscriptions" on push_subscriptions;
create policy "admins read push subscriptions" on push_subscriptions for select
  using (is_admin());
drop policy if exists "admins delete push subscriptions" on push_subscriptions;
create policy "admins delete push subscriptions" on push_subscriptions for delete
  using (is_admin());
