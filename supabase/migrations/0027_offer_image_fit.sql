alter table offers add column if not exists image_fit text not null default 'cover' check (image_fit in ('cover', 'top', 'bottom', 'contain'));
