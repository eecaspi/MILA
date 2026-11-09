alter table banners add column if not exists media_scale int not null default 100 check (media_scale between 40 and 100);
