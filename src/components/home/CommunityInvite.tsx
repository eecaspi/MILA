import { siteConfig } from "@/config/site";

/** "החברות של ליקי" — invitation to the WhatsApp community. */
export function CommunityInvite() {
  const url = siteConfig.community.whatsappUrl;

  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-accent-soft px-4 py-6 text-center sm:px-6 sm:py-10 md:px-12 md:py-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-glow/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-12 -bottom-20 size-52 rounded-full bg-gold/30 blur-3xl"
      />
      <div className="relative mx-auto max-w-xl">
        <p className="eyebrow">החברות של ליקי</p>
        <h2 id="community-title" className="mt-1 text-xl text-ink sm:mt-2 sm:text-3xl md:text-4xl">
          הקהילה של ליקי בוואטסאפ
        </h2>
        <p className="mt-2 text-sm text-ink-soft sm:mt-3 sm:text-base">
          הטבות חדשות ישר לטלפון, בלי ספאם.
        </p>
        <div className="mt-4 sm:mt-6">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-5 !py-2 text-sm sm:!px-7 sm:!py-3 sm:text-base"
            >
              הצטרפי לקהילה בוואטסאפ
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center rounded-full bg-surface px-6 py-3 font-bold text-ink-soft"
            >
              הקבוצות נפתחות בקרוב
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
