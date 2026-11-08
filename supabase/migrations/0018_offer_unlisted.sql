-- "לקבוצה בלבד": a published offer that is left out of the site's lists and search.
-- It still opens from its direct link, so it can be sent to the community group first.
alter table offers add column if not exists unlisted boolean not null default false;
