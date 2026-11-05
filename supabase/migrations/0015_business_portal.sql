create table if not exists business_members (
  business_id uuid not null references businesses (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index if not exists business_members_user on business_members (user_id);

alter table business_members enable row level security;
revoke all on business_members from anon, authenticated;
grant select on business_members to authenticated;
create policy "members see their own links" on business_members for select
  using (user_id = auth.uid() or is_admin());

create or replace function admin_link_business_owner(p_business uuid, p_email text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  p profiles;
begin
  perform _require_admin();
  select * into p from profiles where lower(email) = lower(trim(p_email));
  if not found then
    raise exception 'No member with this email' using errcode = 'P0002';
  end if;
  perform 1 from businesses where id = p_business;
  if not found then
    raise exception 'No such business' using errcode = 'P0002';
  end if;
  insert into business_members (business_id, user_id) values (p_business, p.id) on conflict do nothing;
  if p.role = 'member' then
    update profiles set role = 'business_owner' where id = p.id;
  end if;
  perform _audit('business.link_owner', p.id, p_business::text, jsonb_build_object('email', p.email));
  return jsonb_build_object('status', 'linked', 'user_id', p.id);
end;
$$;

create or replace function admin_unlink_business_owner(p_business uuid, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _require_admin();
  delete from business_members where business_id = p_business and user_id = p_user;
  if not exists (select 1 from business_members where user_id = p_user)
     and exists (select 1 from profiles where id = p_user and role = 'business_owner') then
    update profiles set role = 'member' where id = p_user;
  end if;
  perform _audit('business.unlink_owner', p_user, p_business::text, '{}'::jsonb);
end;
$$;

create or replace function my_businesses() returns table (id uuid, name text, slug text)
language sql stable security definer set search_path = public as $$
  select b.id, b.name, b.slug
  from business_members m join businesses b on b.id = m.business_id
  where m.user_id = auth.uid()
  order by b.name;
$$;

create or replace function _business_offers(p_business uuid, p_from timestamptz) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(t order by t.views desc, t.title), '[]'::jsonb) from (
    select o.id, o.title, o.value_label, o.status, o.valid_until,
      (select count(*) from analytics_events e where e.offer_id = o.id and e.event_type = 'offer_view' and e.occurred_at >= p_from) as views,
      (select count(*) from analytics_events e where e.offer_id = o.id and e.event_type = 'outbound_click' and e.occurred_at >= p_from) as clicks,
      (select count(*) from code_claims c where c.offer_id = o.id and c.expires_at > now()) as live_codes
    from offers o where o.business_id = p_business
  ) t
$$;

create or replace function business_stats(p_business uuid, p_days integer default 30) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_from timestamptz := now() - make_interval(days => v_days);
begin
  if auth.uid() is null
     or not (is_admin() or exists (select 1 from business_members where business_id = p_business and user_id = auth.uid())) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'days', v_days,
    'business_views', (select count(*) from analytics_events where business_id = p_business and event_type = 'business_view' and occurred_at >= v_from),
    'offers', _business_offers(p_business, v_from)
  );
end;
$$;

revoke all on function _business_offers(uuid, timestamptz) from public, anon, authenticated;

revoke all on function admin_link_business_owner(uuid, text), admin_unlink_business_owner(uuid, uuid),
  my_businesses(), business_stats(uuid, integer) from public, anon, authenticated;
grant execute on function admin_link_business_owner(uuid, text), admin_unlink_business_owner(uuid, uuid),
  my_businesses(), business_stats(uuid, integer) to authenticated;
