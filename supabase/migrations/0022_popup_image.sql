alter table site_popup add column if not exists image_url text not null default '' check (char_length(image_url) <= 400);
