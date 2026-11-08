import { siteConfig } from "@/config/site";
import { MailingListForm } from "./MailingListForm";

/** "החברות של ליקי" — invitation to the WhatsApp community. */
export function CommunityInvite() {
  const url = siteConfig.community.whatsappUrl;

  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-accent-soft px-4 py-5 text-center sm:px-6 sm:py-6 md:px-10 md:py-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-glow/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-12 -bottom-20 size-52 rounded-full bg-gold/30 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center md:flex-row md:justify-between md:gap-8 md:text-start">
        <div>
        <p className="eyebrow">החברות של ליקי</p>
        <h2 id="community-title" className="mt-1 text-xl text-ink sm:mt-1 sm:text-2xl md:text-2xl">
          הקהילה של ליקי בוואטסאפ
        </h2>
        <p className="mt-1 text-sm text-ink-soft sm:text-base">
          הטבות חדשות ישר לטלפון, בלי ספאם.
        </p>
        </div>
        <div className="mt-3 md:mt-0 md:shrink-0">
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
      <div className="relative mt-4 border-t border-accent/15 pt-4">
        <MailingListForm />
      </div>
    </section>
  );
}
