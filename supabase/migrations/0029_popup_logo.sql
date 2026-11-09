alter table site_popup add column if not exists logo_url text not null default '' check (char_length(logo_url) <= 400);
