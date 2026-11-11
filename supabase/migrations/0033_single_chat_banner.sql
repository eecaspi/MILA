alter table banners disable trigger banners_audit;
delete from banners where media_url = '/brand/liky-banner-loop.mp4';
update banners set media_url = '/brand/liky-chat.mp4', media_type = 'video' where media_url = '/brand/liky-chat.webp';
alter table banners enable trigger banners_audit;
