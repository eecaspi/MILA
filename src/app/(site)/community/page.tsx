import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "המלצות הקהילה",
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>
        💬
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">המלצות הקהילה — בקרוב</h1>
      <p className="mt-4 text-lg text-ink-soft">
        כאן יופיעו המלצות של נשים מהקהילה על עסקים, אנשי מקצוע ושירותים. אנחנו בונים את זה עכשיו.
      </p>
      <Link
        href="/businesses"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent-bright"
      >
        בינתיים, למדריך העסקים
      </Link>
    </div>
  );
}
