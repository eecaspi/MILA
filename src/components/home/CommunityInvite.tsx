import { siteConfig } from "@/config/site";

/** "החברות של לייקי" — invitation to the WhatsApp community. */
export function CommunityInvite() {
  const url = siteConfig.community.whatsappUrl;

  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-accent-soft px-6 py-10 text-center md:px-12 md:py-14"
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
        <p className="eyebrow">החברות של לייקי</p>
        <h2 id="community-title" className="mt-2 text-3xl text-ink md:text-4xl">
          מציאה שווה? משתפים חברות.
        </h2>
        <p className="mt-3 text-ink-soft">
          הטבות חדשות ישר לטלפון, והמלצות אמיתיות מנשים כמוך. בלי ספאם.
        </p>
        <div className="mt-6">
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
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
