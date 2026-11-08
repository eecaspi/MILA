alter table business_inquiries add column if not exists status text not null default 'new'
  check (status in ('new', 'in_progress', 'closed_ok', 'closed_no', 'problem'));
alter table business_inquiries add column if not exists admin_note text check (char_length(admin_note) <= 1000);
update business_inquiries set status = 'closed_ok' where handled and status = 'new';
