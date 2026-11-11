alter table banners disable trigger banners_audit;
insert into banners (media_url, media_type, layout, title, button_label, link_url, caption_pos, sort_order)
select '/brand/liky-banner-loop.mp4', 'video', 'photo', 'ליקי מצאה לך הטבות שוות',
  'בואי לראות מה מצאתי לך', '/deals', 'left-bottom', 1
where not exists (select 1 from banners b where b.media_url = '/brand/liky-banner-loop.mp4');
alter table banners enable trigger banners_audit;
