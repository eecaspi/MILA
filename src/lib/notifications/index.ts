/**
 * Notifications — channel-agnostic.
 *
 * Product code calls notify(event) and never knows how (or whether) a member is
 * reached. Channels (email, WhatsApp, SMS) plug in here later. Each channel must
 * check the member's opt-in in notification_preferences before sending; every
 * channel defaults to opted-out.
 *
 * Today no channel is registered, so notify() records nothing and sends nothing.
 */

export type NotificationEvent =
  | { type: "points_awarded"; userId: string; points: number }
  | { type: "points_pending"; userId: string; points: number }
  | { type: "reward_available"; userId: string; rewardId: string }
  | { type: "challenge_link"; userId: string; challengeId: string }
  | { type: "personal_offer"; userId: string; offerId: string }
  | { type: "announcement"; audience: "all"; messageId: string };

export type ChannelId = "email" | "whatsapp" | "sms";

export interface NotificationChannel {
  id: ChannelId;
  /** Which events this channel can deliver. */
  supports(event: NotificationEvent): boolean;
  /** Must itself verify opt-in before sending. Returns true if a message was sent. */
  send(event: NotificationEvent): Promise<boolean>;
}

const channels: NotificationChannel[] = [];

export function registerChannel(channel: NotificationChannel): void {
  if (!channels.some((c) => c.id === channel.id)) channels.push(channel);
}

export interface NotifyResult {
  delivered: ChannelId[];
}

/** Never throws: a failed notification must not break the action that triggered it. */
export async function notify(event: NotificationEvent): Promise<NotifyResult> {
  const delivered: ChannelId[] = [];
  for (const channel of channels) {
    if (!channel.supports(event)) continue;
    try {
      if (await channel.send(event)) delivered.push(channel.id);
    } catch (error) {
      console.error(`notification channel ${channel.id} failed`, error);
    }
  }
  return { delivered };
}

/** Test helper. */
export function resetChannelsForTests(): void {
  channels.length = 0;
}
