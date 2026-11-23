create table if not exists business_contracts (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  label text not null check (char_length(label) between 1 and 120),
  terms jsonb not null,
  template_version text not null,
  status text not null default 'sent' check (status in ('sent', 'signed', 'cancelled')),
  created_at timestamptz not null default now(),
  signed_at timestamptz,
  signer_name text,
  signer_role text,
  signed_fields jsonb,
  signer_ip text,
  signer_user_agent text,
  content_hash text
);

alter table business_contracts enable row level security;

drop policy if exists "admins manage business contracts" on business_contracts;
create policy "admins manage business contracts" on business_contracts for all
  using (is_admin()) with check (is_admin());

create or replace function get_business_contract(p_token text)
returns table (
  label text,
  terms jsonb,
  template_version text,
  status text,
  signed_at timestamptz,
  signer_name text,
  signer_role text,
  signed_fields jsonb,
  content_hash text
)
language sql
security definer
set search_path = public
as $$
  select c.label, c.terms, c.template_version, c.status, c.signed_at,
         c.signer_name, c.signer_role, c.signed_fields, c.content_hash
  from business_contracts c
  where c.token = p_token and c.status <> 'cancelled';
$$;

create or replace function sign_business_contract(
  p_token text,
  p_signer_name text,
  p_signer_role text,
  p_fields jsonb,
  p_ip text,
  p_user_agent text,
  p_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  if char_length(btrim(coalesce(p_signer_name, ''))) < 2 then
    raise exception 'signer name required' using errcode = '22023';
  end if;
  update business_contracts
     set status = 'signed',
         signed_at = now(),
         signer_name = btrim(p_signer_name),
         signer_role = nullif(btrim(coalesce(p_signer_role, '')), ''),
         signed_fields = p_fields,
         signer_ip = left(p_ip, 80),
         signer_user_agent = left(p_user_agent, 300),
         content_hash = left(p_hash, 128)
   where token = p_token and status = 'sent';
  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

revoke all on function get_business_contract(text) from public;
revoke all on function sign_business_contract(text, text, text, jsonb, text, text, text) from public;
grant execute on function get_business_contract(text) to anon, authenticated;
grant execute on function sign_business_contract(text, text, text, jsonb, text, text, text) to anon, authenticated;
