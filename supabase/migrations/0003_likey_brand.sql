-- Rebrand MILA -> לייקי (LIKEY): user-facing names stored in the database.
-- Idempotent: safe to run on a fresh or an existing database.

update earning_rules
set title = 'קנייה דרך לייקי',
    description = 'נקודות על קנייה מאומתת דרך קישור של לייקי',
    updated_at = now()
where key = 'purchase_default';

-- Category names follow the new brand voice; two new categories.
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
on conflict (slug) do update
  set name = excluded.name, icon = excluded.icon, sort_order = excluded.sort_order;
