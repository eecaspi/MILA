import { siteConfig } from "@/config/site";

/** "החברות של ליקי" — invitation to the WhatsApp community. */
export function CommunityInvite() {
  const url = siteConfig.community.whatsappUrl;

  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-accent px-6 py-10 text-center text-on-accent md:px-12 md:py-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-12 -bottom-20 size-52 rounded-full bg-glow/30 blur-3xl"
      />
      <div className="relative mx-auto max-w-xl">
        <p className="text-sm font-bold tracking-wide text-white/80">החברות של ליקי</p>
        <h2 id="community-title" className="mt-2 text-3xl text-on-accent md:text-4xl">
          מציאה שווה? משתפים חברות.
        </h2>
        <p className="mt-3 text-white/85">
          הטבות חדשות ישר לטלפון, והמלצות אמיתיות מנשים כמוך. בלי ספאם.
        </p>
        <div className="mt-6">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-white px-7 py-3 font-bold text-accent shadow-[var(--shadow-soft)] transition hover:bg-accent-soft"
            >
              הצטרפי לקהילה בוואטסאפ
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center rounded-full bg-white/20 px-6 py-3 font-bold text-white"
            >
              הקבוצות נפתחות בקרוב
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
