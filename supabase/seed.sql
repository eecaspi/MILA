-- Categories seed (matches src/data/categories.ts). Migration 0003 keeps
-- existing databases in sync. Demo businesses/offers live in src/data/ and are
-- NOT seeded into the database, so demo content never reaches production data.
insert into categories (slug, name, icon, sort_order) values
  ('fashion', 'אופנה', null, 1),
  ('baby-kids', 'ילדים ותינוקות', null, 2),
  ('home', 'בית ועיצוב', null, 3),
  ('beauty', 'טיפוח ויופי', null, 4),
  ('food', 'אוכל ומטבח', null, 5),
  ('gifts', 'מתנות', null, 6),
  ('leisure', 'פנאי וחוויות', null, 7),
  ('events', 'שמחות ואירועים', null, 8),
  ('books-judaica', 'ספרים ויודאיקה', null, 9),
  ('health-community', 'בריאות וחסד', null, 10)
on conflict (slug) do nothing;
