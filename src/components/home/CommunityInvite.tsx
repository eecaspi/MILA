import Image from "next/image";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/ui/ChannelIcons";
import { MailingListButton } from "./MailingListForm";

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
      <div className="relative mx-auto flex max-w-5xl flex-col items-center md:flex-row md:items-center md:justify-between md:gap-8 md:text-start">
        <Image
          src="/brand/liky-community-icons.webp"
          alt="ליקי עם סמל של וואטסאפ וסמל של מייל"
          width={640}
          height={474}
          sizes="224px"
          className="hidden h-auto w-44 shrink-0 self-end md:-mb-6 md:block lg:w-56"
        />
        <div className="min-w-0 md:flex-1">
        <p className="eyebrow">הקהילה של ליקי</p>
        <h2 id="community-title" className="mt-1 text-xl text-ink sm:mt-1 sm:text-2xl md:text-2xl">
          הטבות חדשות ישר אלייך
        </h2>
        <p className="mt-1 text-sm text-ink-soft sm:text-base">
          בוואטסאפ או במייל, בלי ספאם. את בוחרת איפה נוח לך.
        </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:mt-0 md:w-64 md:shrink-0 md:flex-col md:items-stretch">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 !px-5 !py-2 text-sm sm:!px-7 sm:!py-3 sm:text-base"
            >
              <WhatsAppIcon className="size-5" />
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
          <MailingListButton />
        </div>
      </div>
    </section>
  );
}
