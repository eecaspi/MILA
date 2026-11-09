alter table site_popup add column if not exists liky_url text not null default '' check (char_length(liky_url) <= 400);
