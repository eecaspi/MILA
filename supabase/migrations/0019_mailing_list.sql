create table if not exists mailing_list (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 5 and 120),
  consent_at timestamptz not null default now(),
  constraint mailing_list_email_unique unique (email)
);

alter table mailing_list enable row level security;
revoke all on mailing_list from anon, authenticated;
grant select, delete on mailing_list to authenticated;
create policy "admins read mailing list" on mailing_list for select using (is_admin());
create policy "admins delete mailing list" on mailing_list for delete using (is_admin());

create or replace function join_mailing_list(p_name text, p_email text, p_consent boolean)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not coalesce(p_consent, false) then
    raise exception 'Consent required' using errcode = '22023';
  end if;
  insert into mailing_list (name, email)
  values (trim(p_name), lower(trim(p_email)))
  on conflict (email) do nothing;
end;
$$;

revoke all on function join_mailing_list(text, text, boolean) from public;
grant execute on function join_mailing_list(text, text, boolean) to anon, authenticated;
