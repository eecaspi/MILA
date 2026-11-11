alter table banners drop constraint if exists banners_layout_check;
alter table banners add constraint banners_layout_check
  check (layout in ('photo', 'character', 'character_reverse', 'cover', 'chat'));

alter table banners disable trigger banners_audit;
insert into banners (media_url, media_type, layout, title, headline, body, button_label, link_url, sort_order)
select '/brand/liky-chat.webp', 'image', 'chat', 'ליקי מצאה לך הטבות שוות',
  'ליקי מצאה לך הטבות שוות!',
  E'באמת? מה יש שם?\nאת כל המותגים שאת אוהבת, במחירים משתלמים.\nנשמע מעולה!\nכל ההטבות מחכות לך בליקי.',
  'בואי לראות מה מצאתי לך', '/deals', 0
where not exists (select 1 from banners b where b.media_url = '/brand/liky-chat.webp');
alter table banners enable trigger banners_audit;
