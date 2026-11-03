-- Back office: content managed by admins, privacy-friendly visit analytics, admin team.
--
--  * Businesses and offers get the fields the back office edits, plus a publish switch.
--    The public site only ever sees published rows.
--  * Coupon codes move to an admin-only table, so they cannot be read through the API
--    while the site is in showcase mode (codes hidden, benefits shown).
--  * Every content change by an admin is written to admin_audit_log automatically.
--  * analytics_events stores page views and clicks without cookies, IP addresses or
--    names: only a daily-rotating anonymous visitor hash computed on the server.

-- =====================================================================
-- Content fields
-- =====================================================================

alter table businesses
  add column if not exists description text not null default '',
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists logo_url text,
  add column if not exists cover_url text,
  add column if not exists is_published boolean not null default false,
  add column if not exists sort_order integer not null default 0;

alter table businesses
  add constraint businesses_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint businesses_name_length check (length(trim(name)) between 2 and 120),
  add constraint businesses_website_https check (website is null or website ~ '^https?://');

alter table offers
  add column if not exists image_url text,
  add column if not exists price_label text,
  add column if not exists highlight boolean not null default false,
  add column if not exists likey_pick_note text,
  add column if not exists is_published boolean not null default false;

alter table offers
  add constraint offers_title_length check (length(trim(title)) between 2 and 160),
  add constraint offers_value_label_length check (length(trim(value_label)) between 1 and 60);

create index if not exists businesses_published on businesses (is_published, sort_order);
create index if not exists offers_published on offers (is_published, created_at desc);

create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists businesses_touch on businesses;
create trigger businesses_touch before update on businesses
  for each row execute function touch_updated_at();
drop trigger if exists offers_touch on offers;
create trigger offers_touch before update on offers
  for each row execute function touch_updated_at();

-- =====================================================================
-- Coupon codes: admin-only
-- =====================================================================

create table offer_codes (
  offer_id uuid primary key references offers (id) on delete cascade,
  coupon_code text not null check (length(trim(coupon_code)) between 1 and 60),
  updated_at timestamptz not null default now()
);

insert into offer_codes (offer_id, coupon_code)
select id, coupon_code from offers where coupon_code is not null and length(trim(coupon_code)) > 0;

alter table offers drop column if exists coupon_code;

alter table offer_codes enable row level security;
create policy "admins manage offer codes" on offer_codes for all using (is_admin()) with check (is_admin());

-- =====================================================================
-- Public site sees published content only
-- =====================================================================

drop policy if exists "businesses readable" on businesses;
create policy "published businesses readable" on businesses for select
  using (is_published or is_admin());

drop policy if exists "offers readable" on offers;
create policy "published offers readable" on offers for select
  using (
    (is_published and exists (select 1 from businesses b where b.id = business_id and b.is_published))
    or is_admin()
  );

-- =====================================================================
-- Automatic audit trail for content changes
-- =====================================================================

create or replace function audit_content_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb := to_jsonb(coalesce(new, old));
begin
  insert into admin_audit_log (actor_id, action, target_id, details)
  values (
    auth.uid(),
    tg_table_name || '.' || lower(tg_op),
    coalesce(v_row ->> 'id', v_row ->> 'offer_id'),
    jsonb_build_object('name', coalesce(v_row ->> 'name', v_row ->> 'title'))
      || case when tg_op = 'UPDATE' and (to_jsonb(old) ->> 'is_published') is distinct from (to_jsonb(new) ->> 'is_published')
              then jsonb_build_object('published', (to_jsonb(new) ->> 'is_published')::boolean)
              else '{}'::jsonb end
  );
  return null;
end;
$$;

create trigger businesses_audit after insert or update or delete on businesses
  for each row execute function audit_content_change();
create trigger offers_audit after insert or update or delete on offers
  for each row execute function audit_content_change();
create trigger offer_codes_audit after insert or update or delete on offer_codes
  for each row execute function audit_content_change();

-- =====================================================================
-- Analytics
-- =====================================================================

create type analytics_event_type as enum ('page_view', 'offer_view', 'business_view', 'outbound_click', 'cta_click');

create table analytics_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_type analytics_event_type not null,
  path text not null check (path ~ '^/' and length(path) <= 300),
  business_id uuid references businesses (id) on delete set null,
  offer_id uuid references offers (id) on delete set null,
  referrer_host text check (length(referrer_host) <= 120),
  device text not null default 'other' check (device in ('mobile', 'tablet', 'desktop', 'other')),
  visitor_hash text not null check (length(visitor_hash) between 16 and 64),
  utm_source text check (length(utm_source) <= 60)
);

create index analytics_events_time on analytics_events (occurred_at desc);
create index analytics_events_business on analytics_events (business_id, occurred_at desc) where business_id is not null;
create index analytics_events_offer on analytics_events (offer_id, occurred_at desc) where offer_id is not null;

alter table analytics_events enable row level security;
create policy "admins read analytics" on analytics_events for select using (is_admin());
revoke insert, update, delete, truncate on analytics_events, offer_codes from anon;
revoke insert, update, delete, truncate on analytics_events from authenticated;

-- Records one event. Called by the site's /api/track route; it validates and
-- normalises everything, and silently ignores admin pages and unknown ids.
create or replace function track_event(
  p_type analytics_event_type,
  p_path text,
  p_visitor_hash text,
  p_device text default 'other',
  p_business uuid default null,
  p_offer uuid default null,
  p_referrer_host text default null,
  p_utm_source text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_business uuid := p_business;
begin
  if p_path is null or left(p_path, 1) <> '/' or p_path like '/admin%' or p_path like '/api/%' then
    return;
  end if;
  if p_visitor_hash is null or length(p_visitor_hash) not between 16 and 64 then
    return;
  end if;
  if p_offer is not null and not exists (select 1 from offers where id = p_offer) then
    p_offer := null;
  end if;
  if p_offer is not null and v_business is null then
    select business_id into v_business from offers where id = p_offer;
  end if;
  if v_business is not null and not exists (select 1 from businesses where id = v_business) then
    v_business := null;
  end if;

  insert into analytics_events (event_type, path, business_id, offer_id, referrer_host, device, visitor_hash, utm_source)
  values (
    p_type,
    left(split_part(p_path, '?', 1), 300),
    v_business,
    p_offer,
    nullif(left(lower(p_referrer_host), 120), ''),
    case when p_device in ('mobile', 'tablet', 'desktop') then p_device else 'other' end,
    p_visitor_hash,
    nullif(left(p_utm_source, 60), '')
  );
end;
$$;

-- Dashboard numbers for the back office. Days are counted in Israel time.
create or replace function admin_analytics(p_days integer default 30) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_from timestamptz := date_trunc('day', now() at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem'
                        - make_interval(days => v_days - 1);
  v_prev timestamptz := v_from - make_interval(days => v_days);
  v jsonb;
begin
  perform _require_admin();

  with cur as (select * from analytics_events where occurred_at >= v_from),
       prev as (select * from analytics_events where occurred_at >= v_prev and occurred_at < v_from)
  select jsonb_build_object(
    'days', v_days,
    'totals', jsonb_build_object(
      'page_views', (select count(*) from cur where event_type = 'page_view'),
      'visitors', (select count(distinct visitor_hash) from cur),
      'offer_views', (select count(*) from cur where event_type = 'offer_view'),
      'outbound_clicks', (select count(*) from cur where event_type = 'outbound_click')
    ),
    'previous', jsonb_build_object(
      'page_views', (select count(*) from prev where event_type = 'page_view'),
      'visitors', (select count(distinct visitor_hash) from prev),
      'offer_views', (select count(*) from prev where event_type = 'offer_view'),
      'outbound_clicks', (select count(*) from prev where event_type = 'outbound_click')
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'page_views', coalesce(c.pv, 0), 'visitors', coalesce(c.vis, 0)) order by d.day), '[]')
      from (
        select generate_series((v_from at time zone 'Asia/Jerusalem')::date, (now() at time zone 'Asia/Jerusalem')::date, interval '1 day')::date as day
      ) d
      left join (
        select (occurred_at at time zone 'Asia/Jerusalem')::date as day,
               count(*) filter (where event_type = 'page_view') as pv,
               count(distinct visitor_hash) as vis
        from cur group by 1
      ) c on c.day = d.day
    ),
    'top_pages', (
      select coalesce(jsonb_agg(t), '[]') from (
        select path, count(*) as views from cur where event_type = 'page_view'
        group by path order by views desc, path limit 10
      ) t
    ),
    'top_businesses', (
      select coalesce(jsonb_agg(t), '[]') from (
        select b.id, b.name,
               count(*) filter (where e.event_type in ('offer_view', 'business_view')) as views,
               count(*) filter (where e.event_type = 'outbound_click') as clicks
        from cur e join businesses b on b.id = e.business_id
        group by b.id, b.name order by count(*) desc, b.name limit 10
      ) t
    ),
    'top_offers', (
      select coalesce(jsonb_agg(t), '[]') from (
        select o.id, o.title, b.name as business, count(*) as views
        from cur e join offers o on o.id = e.offer_id join businesses b on b.id = o.business_id
        where e.event_type = 'offer_view'
        group by o.id, o.title, b.name order by views desc, o.title limit 10
      ) t
    ),
    'referrers', (
      select coalesce(jsonb_agg(t), '[]') from (
        select coalesce(referrer_host, 'direct') as source, count(distinct visitor_hash) as visitors
        from cur where event_type = 'page_view'
        group by 1 order by visitors desc limit 8
      ) t
    ),
    'devices', (
      select coalesce(jsonb_agg(t), '[]') from (
        select device, count(distinct visitor_hash) as visitors from cur group by device order by visitors desc
      ) t
    )
  ) into v;
  return v;
end;
$$;

-- =====================================================================
-- Admin team
-- =====================================================================

create or replace function admin_set_role(p_email text, p_role user_role) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  p profiles;
begin
  perform _require_admin();
  select * into p from profiles where lower(email) = lower(trim(p_email));
  if not found then
    raise exception 'No member with this email' using errcode = 'P0002';
  end if;
  if p.role = 'admin' and p_role <> 'admin'
     and (select count(*) from profiles where role = 'admin') <= 1 then
    raise exception 'Cannot remove the last admin' using errcode = '22023';
  end if;
  update profiles set role = p_role where id = p.id;
  perform _audit('team.set_role', p.id, p.id::text, jsonb_build_object('email', p.email, 'role', p_role, 'from', p.role));
  return jsonb_build_object('status', 'updated', 'user_id', p.id);
end;
$$;

-- =====================================================================
-- Privileges
-- =====================================================================

revoke all on function
  touch_updated_at(), audit_content_change(),
  track_event(analytics_event_type, text, text, text, uuid, uuid, text, text),
  admin_analytics(integer), admin_set_role(text, user_role)
from public, anon, authenticated;

grant execute on function track_event(analytics_event_type, text, text, text, uuid, uuid, text, text) to anon, authenticated;
grant execute on function admin_analytics(integer), admin_set_role(text, user_role) to authenticated;
