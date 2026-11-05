-- Consent records taken at sign-up: terms/privacy acceptance and (optional) marketing mail.
-- Timestamps are set here, on the server, never taken from the browser.
alter table profiles add column if not exists terms_accepted_at timestamptz;
alter table profiles add column if not exists terms_version text;
alter table profiles add column if not exists marketing_consent boolean not null default false;
alter table profiles add column if not exists marketing_consent_at timestamptz;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  channel text := new.raw_user_meta_data ->> 'community_channel';
  terms boolean := coalesce(new.raw_user_meta_data ->> 'terms_accepted', '') = 'true';
  marketing boolean := coalesce(new.raw_user_meta_data ->> 'marketing_consent', '') = 'true';
begin
  insert into profiles (
    id, email, display_name, community_channel,
    terms_accepted_at, terms_version, marketing_consent, marketing_consent_at
  )
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    case when channel in ('whatsapp', 'email') then channel end,
    case when terms then now() end,
    case when terms then left(new.raw_user_meta_data ->> 'terms_version', 40) end,
    marketing,
    case when marketing then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
