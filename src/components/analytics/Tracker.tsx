"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Payload = {
  type: "page_view" | "offer_view" | "business_view" | "outbound_click" | "cta_click";
  path: string;
  businessId?: string;
  offerId?: string;
  referrer?: string;
  utm?: string;
};

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function track(payload: Payload) {
  if (typeof window === "undefined" || optedOut()) return;
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  } else {
    void fetch("/api/track", { method: "POST", body, keepalive: true });
  }
}

let firstView = true;

/**
 * Page views on every navigation, plus clicks on any link marked with
 * data-track-business (outbound links to a business's site).
 */
export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    track({
      type: "page_view",
      path: pathname,
      // The referrer only means something for the first page of a visit.
      referrer: firstView ? document.referrer : undefined,
      utm: params.get("utm_source") ?? undefined,
    });
    firstView = false;
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a[data-track-business]");
      if (!link) return;
      track({
        type: "outbound_click",
        path: window.location.pathname,
        businessId: link.getAttribute("data-track-business") ?? undefined,
        offerId: link.getAttribute("data-track-offer") ?? undefined,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

/** Drop into a page to record a single view of an offer or business. */
export function TrackView({
  type,
  offerId,
  businessId,
}: Pick<Payload, "type" | "offerId" | "businessId">) {
  const pathname = usePathname();
  useEffect(() => {
    track({ type, path: pathname, offerId, businessId });
  }, [type, pathname, offerId, businessId]);
  return null;
}
