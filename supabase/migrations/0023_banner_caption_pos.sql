alter table banners add column if not exists caption_pos text not null default 'right-top' check (caption_pos ~ '^(right|left|center)-(top|middle|bottom)$');
