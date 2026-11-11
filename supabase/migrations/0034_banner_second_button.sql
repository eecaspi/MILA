alter table banners add column if not exists button2_label text check (char_length(button2_label) <= 30);
alter table banners add column if not exists link2_url text check (char_length(link2_url) <= 300);
