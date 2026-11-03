import { siteConfig } from "@/config/site";

/** "החברות של לייקי" — invitation to the WhatsApp community. */
export function CommunityInvite() {
  const url = siteConfig.community.whatsappUrl;

  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-ink p-7 text-white md:p-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-20 -top-20 size-72 rounded-full bg-orchid/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-16 -bottom-24 size-64 rounded-full bg-gold/25 blur-3xl"
      />
      <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="text-sm font-bold text-accent-soft">החברות של לייקי</p>
          <h2 id="community-title" className="mt-2 text-3xl md:text-4xl">
            מציאה שווה? משתפים חברות.
          </h2>
          <p className="mt-4 max-w-lg text-white/80">
            קבוצות הוואטסאפ של לייקי הן המקום לקבל ראשונה את ההטבות החדשות, לשאול &quot;מישהי
            מכירה...?&quot; ולשתף מה מצאת.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                הצטרפי לקהילה בוואטסאפ
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex cursor-not-allowed items-center rounded-full bg-white/10 px-6 py-3 font-bold text-white/80"
              >
                הקבוצות נפתחות בקרוב
              </span>
            )}
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          {[
            "הטבות חדשות ישר לטלפון",
            "המלצות אמיתיות מנשים כמוך",
            "בלי ספאם – רק דברים ששווה לדעת",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-gold" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
