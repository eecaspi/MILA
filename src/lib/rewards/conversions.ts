/**
 * Affiliate conversion intake — interface only.
 *
 * When MILA joins an affiliate network, add an adapter that verifies the network's
 * webhook signature and turns its payload into ConversionEvents. The route
 * /api/affiliate/conversions/[network] then hands each event to the database
 * function record_conversion(), which owns idempotency, pending → approved
 * transitions, cancellations/refunds and the points calculation.
 *
 * Until an adapter is registered, the endpoint answers 501 and no purchase is
 * ever treated as verified.
 */
import type { ConversionStatus } from "./types.ts";

export interface ConversionEvent {
  /** The network's own order/transaction id. Together with `network` it is the dedupe key. */
  externalId: string;
  status: ConversionStatus;
  /** Commission MILA actually earns, in agorot. Points are derived from this, never from order value. */
  commissionAgorot: number;
  orderAmountAgorot?: number;
  occurredAt: string;
  /** Resolved from the referral link / sub-id the network echoes back. */
  userId?: string;
  businessId?: string;
  referralLinkId?: string;
  raw?: unknown;
}

export interface AffiliateNetworkAdapter {
  /** Stable id used in the URL and stored on each conversion, e.g. "awin". */
  network: string;
  /** Must verify the request really came from the network (signature, shared secret, IP list). */
  verify(request: Request, rawBody: string): Promise<boolean>;
  parse(rawBody: string): ConversionEvent[];
}

const adapters = new Map<string, AffiliateNetworkAdapter>();

export function registerAdapter(adapter: AffiliateNetworkAdapter): void {
  adapters.set(adapter.network, adapter);
}

export function getAdapter(network: string): AffiliateNetworkAdapter | undefined {
  return adapters.get(network);
}

/** Arguments for the record_conversion() database function. */
export function toRecordConversionArgs(network: string, e: ConversionEvent) {
  return {
    p_network: network,
    p_external_id: e.externalId,
    p_status: e.status,
    p_commission_agorot: e.commissionAgorot,
    p_occurred_at: e.occurredAt,
    p_user: e.userId ?? null,
    p_business: e.businessId ?? null,
    p_order_amount_agorot: e.orderAmountAgorot ?? null,
    p_referral_link: e.referralLinkId ?? null,
    p_raw: e.raw ?? null,
  };
}

/** Basic shape checks before anything reaches the database. */
export function validateEvent(e: ConversionEvent): string | null {
  if (!e.externalId) return "missing externalId";
  if (!["pending", "approved", "cancelled", "refunded"].includes(e.status)) return "invalid status";
  if (!Number.isSafeInteger(e.commissionAgorot) || e.commissionAgorot < 0)
    return "invalid commission";
  if (Number.isNaN(Date.parse(e.occurredAt))) return "invalid occurredAt";
  return null;
}
