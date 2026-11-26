create or replace function admin_delete_member(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_email text;
begin
  perform _require_admin();
  if p_user = auth.uid() then
    raise exception 'cannot delete yourself' using errcode = '22023';
  end if;
  select role, email into v_role, v_email from profiles where id = p_user;
  if not found then
    return;
  end if;
  if v_role = 'admin' then
    raise exception 'cannot delete an admin' using errcode = '22023';
  end if;
  if exists (select 1 from businesses where owner_id = p_user)
     or exists (select 1 from points_transactions where user_id = p_user)
     or exists (select 1 from admin_audit_log where target_user_id = p_user or actor_id = p_user) then
    raise exception 'member has history' using errcode = '23503';
  end if;
  delete from auth.users where id = p_user;
  perform _audit('members.delete', null, p_user::text, jsonb_build_object('email', v_email));
end;
$$;

revoke all on function admin_delete_member(uuid) from public;
grant execute on function admin_delete_member(uuid) to authenticated;
