-- How a member chose to stay in touch (asked at sign-up): the WhatsApp group or the email list.
alter table profiles add column if not exists community_channel text;
alter table profiles drop constraint if exists profiles_community_channel_check;
alter table profiles add constraint profiles_community_channel_check
  check (community_channel is null or community_channel in ('whatsapp', 'email'));

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  channel text := new.raw_user_meta_data ->> 'community_channel';
begin
  insert into profiles (id, email, display_name, community_channel)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    case when channel in ('whatsapp', 'email') then channel end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Members who signed up before this column existed.
update profiles p
set community_channel = u.raw_user_meta_data ->> 'community_channel'
from auth.users u
where u.id = p.id
  and p.community_channel is null
  and (u.raw_user_meta_data ->> 'community_channel') in ('whatsapp', 'email');
