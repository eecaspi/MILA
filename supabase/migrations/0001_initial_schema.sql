-- MILA initial schema
-- Phase 1: directory + offers. Phase 3 tables (affiliates) are created now so
-- the data model is stable, but nothing writes to them yet.

create type verification_status as enum ('demo', 'listed', 'verified');
create type offer_kind as enum ('deal', 'coupon');
create type user_role as enum ('member', 'business_owner', 'admin');

-- ---------- Profiles ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role user_role not null default 'member',
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- Directory ----------
create table categories (
  slug text primary key,
  name text not null,
  icon text,
  sort_order int not null default 0
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_slug text not null references categories (slug),
  short_description text not null default '',
  area text not null default '',
  website text,
  source_url text,
  tags text[] not null default '{}',
  status verification_status not null default 'listed',
  is_real_business boolean not null default true,
  owner_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  kind offer_kind not null,
  title text not null,
  description text not null default '',
  value_label text not null,
  coupon_code text,
  valid_until date,
  status verification_status not null default 'listed',
  commission_rate numeric(5, 4) check (commission_rate between 0 and 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- An offer on a real business must never be demo content: demo offers may only
-- belong to fictional sample businesses.
create or replace function enforce_no_demo_offers_on_real_businesses() returns trigger
language plpgsql as $$
begin
  if new.status = 'demo'
     and (select is_real_business from businesses where id = new.business_id) then
    raise exception 'Demo offers cannot be attached to a real business (business %)', new.business_id;
  end if;
  return new;
end;
$$;

create trigger offers_no_demo_on_real
  before insert or update on offers
  for each row execute function enforce_no_demo_offers_on_real_businesses();

create index on businesses (category_slug);
create index on offers (business_id);

-- ---------- Affiliate program (phase 3) ----------
create table affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references profiles (id) on delete cascade,
  display_name text not null,
  referral_code text unique not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

create table referral_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates (id) on delete cascade,
  offer_id uuid references offers (id) on delete set null,
  business_id uuid references businesses (id) on delete set null,
  code text unique not null,
  created_at timestamptz not null default now()
);

create table referral_clicks (
  id bigint generated always as identity primary key,
  referral_link_id uuid not null references referral_links (id) on delete cascade,
  clicked_at timestamptz not null default now()
);

create table commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates (id),
  referral_link_id uuid not null references referral_links (id),
  amount_agorot integer not null check (amount_agorot >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'rejected')),
  created_at timestamptz not null default now()
);

-- ---------- Row level security ----------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table businesses enable row level security;
alter table offers enable row level security;
alter table affiliates enable row level security;
alter table referral_links enable row level security;
alter table referral_clicks enable row level security;
alter table commissions enable row level security;

-- Public read for the directory.
create policy "categories readable" on categories for select using (true);
create policy "businesses readable" on businesses for select using (true);
create policy "offers readable" on offers for select using (true);

-- Admins manage the directory.
create policy "admins manage categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admins manage businesses" on businesses for all using (is_admin()) with check (is_admin());
create policy "admins manage offers" on offers for all using (is_admin()) with check (is_admin());

-- Users see and edit their own profile (role changes are admin-only).
create policy "own profile readable" on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile insert" on profiles for insert with check (id = auth.uid() and role = 'member');
create policy "admins manage profiles" on profiles for update using (is_admin()) with check (is_admin());

-- Affiliates see only their own data.
create policy "own affiliate row" on affiliates for select using (user_id = auth.uid() or is_admin());
create policy "own referral links" on referral_links for select
  using (affiliate_id in (select id from affiliates where user_id = auth.uid()) or is_admin());
create policy "own commissions" on commissions for select
  using (affiliate_id in (select id from affiliates where user_id = auth.uid()) or is_admin());
create policy "admins manage affiliates" on affiliates for all using (is_admin()) with check (is_admin());
create policy "admins manage referral links" on referral_links for all using (is_admin()) with check (is_admin());
create policy "admins manage commissions" on commissions for all using (is_admin()) with check (is_admin());
create policy "admins read clicks" on referral_clicks for select using (is_admin());
