alter table banners add column if not exists button2_label text check (char_length(button2_label) <= 30);
alter table banners add column if not exists link2_url text check (char_length(link2_url) <= 300);
update banners set
  button_label = 'בואי תכירי אותי', link_url = '/about',
  button2_label = 'בואי להיות חברה שלי', link2_url = '/login?mode=signup'
where media_url = '/brand/liky-character-bag.jpg';
