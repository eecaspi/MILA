alter table offers drop constraint if exists offers_redeem_channel_check;
alter table offers add constraint offers_redeem_channel_check
  check (redeem_channel is null or redeem_channel in ('online', 'store', 'stores', 'both'));
alter table businesses add column if not exists branches text not null default '' check (char_length(branches) <= 2000);
