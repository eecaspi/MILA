create table if not exists business_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_name text not null check (char_length(business_name) between 1 and 120),
  contact_name text not null check (char_length(contact_name) between 1 and 80),
  phone text not null check (char_length(phone) between 5 and 30),
  email text check (char_length(email) <= 120),
  website text check (char_length(website) <= 200),
  message text check (char_length(message) <= 1000),
  consent_at timestamptz not null default now(),
  handled boolean not null default false
);

alter table business_inquiries enable row level security;
revoke all on business_inquiries from anon, authenticated;
grant select, update, delete on business_inquiries to authenticated;
create policy "admins read inquiries" on business_inquiries for select using (is_admin());
create policy "admins update inquiries" on business_inquiries for update using (is_admin()) with check (is_admin());
create policy "admins delete inquiries" on business_inquiries for delete using (is_admin());

create or replace function submit_business_inquiry(
  p_business text, p_name text, p_phone text, p_email text, p_website text, p_message text, p_consent boolean
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not coalesce(p_consent, false) then
    raise exception 'Consent required' using errcode = '22023';
  end if;
  perform 1 from business_inquiries where phone = trim(p_phone) and created_at > now() - interval '10 minutes';
  if found then
    return;
  end if;
  insert into business_inquiries (business_name, contact_name, phone, email, website, message)
  values (trim(p_business), trim(p_name), trim(p_phone), nullif(trim(p_email), ''), nullif(trim(p_website), ''), nullif(trim(p_message), ''));
end;
$$;

revoke all on function submit_business_inquiry(text, text, text, text, text, text, boolean) from public;
grant execute on function submit_business_inquiry(text, text, text, text, text, text, boolean) to anon, authenticated;
