-- Home banners get a layout, a headline, a text and a button label, so the Liky character
-- slides can be managed from the back office like any other banner.
alter table banners add column if not exists layout text not null default 'photo';
alter table banners add column if not exists headline text;
alter table banners add column if not exists body text;
alter table banners add column if not exists button_label text;

alter table banners drop constraint if exists banners_layout_check;
alter table banners add constraint banners_layout_check
  check (layout in ('photo', 'character', 'character_reverse', 'cover'));

-- The four built-in Liky slides become ordinary banners (once).
alter table banners disable trigger banners_audit;
insert into banners (media_url, media_type, layout, title, headline, body, button_label, link_url, sort_order)
select v.* from (values
  ('/brand/liky-character-bag.jpg', 'image', 'character', 'ליקי עם שקית של האתר',
   'היי, אני ליקי', 'כאן לשירותך, עם ההטבות והמבצעים הכי שווים במקום אחד.', 'בואי לראות מה מצאתי לך', '/deals', -4),
  ('/brand/liky-banner-red.jpg', 'image', 'cover', 'ליקי, יש לי קישור בשבילך',
   null, null, 'בואי לראות מה מצאתי לך', '/deals', -3),
  ('/brand/liky-presenting.jpg', 'image', 'character', 'ליקי מציגה שקית של האתר',
   'יש לי קישור בשבילך.', 'מצטרפות בחינם ומקבלות קוד קופון להטבות של העסקים.', 'אני רוצה להצטרף', '/login?mode=signup', -2),
  ('/brand/liky-podcast.jpg', 'image', 'character_reverse', 'ליקי מספרת על ההטבות',
   'בואי להצטרף לקהילה של ליקי', 'הקבוצה שלנו בוואטסאפ: הטבות חדשות והמלצות ישר לטלפון.', 'הצטרפי לקהילה', '/community', -1)
) as v(media_url, media_type, layout, title, headline, body, button_label, link_url, sort_order)
where not exists (select 1 from banners b where b.media_url = v.media_url);
alter table banners enable trigger banners_audit;
