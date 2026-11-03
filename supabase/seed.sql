-- Categories seed (matches src/data/categories.ts).
-- Demo businesses/offers live in src/data/ for now and are NOT seeded into the
-- database, so demo content can never leak into production data.
insert into categories (slug, name, icon, sort_order) values
  ('food', 'מזון וסופרמרקטים', '🛒', 1),
  ('fashion', 'אופנה צנועה', '👗', 2),
  ('baby-kids', 'תינוקות וילדים', '🍼', 3),
  ('home', 'בית ומטבח', '🏠', 4),
  ('books-judaica', 'ספרים ויודאיקה', '📚', 5),
  ('health-community', 'בריאות וחסד', '🤝', 6),
  ('beauty', 'טיפוח ופאות', '💇‍♀️', 7),
  ('events', 'שמחות ואירועים', '🎉', 8)
on conflict (slug) do nothing;
