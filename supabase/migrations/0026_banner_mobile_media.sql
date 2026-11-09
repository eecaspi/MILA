alter table banners add column if not exists mobile_url text not null default '' check (char_length(mobile_url) <= 600);
alter table banners add column if not exists mobile_scale int not null default 100 check (mobile_scale between 40 and 100);
