create table if not exists problem_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text check (char_length(name) <= 80),
  contact text not null check (char_length(contact) between 5 and 120),
  message text not null check (char_length(message) between 1 and 1500),
  page text check (char_length(page) <= 300),
  handled boolean not null default false
);

alter table problem_reports enable row level security;
revoke all on problem_reports from anon, authenticated;
grant select, update, delete on problem_reports to authenticated;
create policy "admins read reports" on problem_reports for select using (is_admin());
create policy "admins update reports" on problem_reports for update using (is_admin()) with check (is_admin());
create policy "admins delete reports" on problem_reports for delete using (is_admin());

create or replace function submit_problem_report(p_name text, p_contact text, p_message text, p_page text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform 1 from problem_reports where contact = trim(p_contact) and created_at > now() - interval '2 minutes';
  if found then
    return;
  end if;
  insert into problem_reports (name, contact, message, page)
  values (nullif(trim(p_name), ''), trim(p_contact), trim(p_message), nullif(trim(p_page), ''));
end;
$$;

revoke all on function submit_problem_report(text, text, text, text) from public;
grant execute on function submit_problem_report(text, text, text, text) to anon, authenticated;
