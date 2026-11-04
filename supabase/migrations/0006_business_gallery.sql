-- A few photos from each business (products, the shop), shown when a visitor
-- hovers or taps a business card. Images live in the public media bucket.

alter table businesses
  add column if not exists gallery_urls text[] not null default '{}';

alter table businesses drop constraint if exists businesses_gallery_size;
alter table businesses
  add constraint businesses_gallery_size check (cardinality(gallery_urls) <= 8);
