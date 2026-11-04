import Link from "next/link";
import { TagMark } from "@/components/brand/TagMark";
import { siteConfig } from "@/config/site";

const ways = [
  {
    title: "קונות דרך לייקי",
    text: "נקודות על קניות מאומתות דרך הקישורים שלנו",
    tone: "bg-tone-rose",
  },
  {
    title: "משתפות ומזמינות",
    text: "על המלצות, על חברות שמצטרפות ועל פעילויות",
    tone: "bg-tone-lilac",
  },
  {
    title: "פותחות הטבות",
    text: "את הנקודות יהיה אפשר להמיר בהטבות של העסקים",
    tone: "bg-tone-mint",
  },
];

/** "מועדון לייקי" — a preview of the loyalty club. It is not active yet, so no benefits are promised. */
export function ClubPreview() {
  return (
    <section
      id="club"
      aria-labelledby="club-title"
      className="accent-frame rounded-[var(--radius-card)] p-7 md:p-12"
    >
      <div className="flex flex-wrap items-center gap-3">
        <TagMark size={32} />
        <p className="eyebrow">מועדון לייקי</p>
        <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-ink">בהכנה</span>
      </div>
      <h2 id="club-title" className="mt-4 max-w-xl text-3xl text-ink md:text-4xl">
        בקרוב: מועדון שמחזיר לך על כל קנייה חכמה
      </h2>
      <p className="mt-3 max-w-xl text-ink-soft">
        אנחנו בונות את המועדון בזהירות, כדי שיהיה שווה באמת. המועדון עוד לא פעיל, ותהיי מהראשונות
        לשמוע כשהוא נפתח.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {ways.map((w) => (
          <li key={w.title} className={`rounded-[var(--radius-card)] p-5 ${w.tone}`}>
            <p className="font-display text-lg font-bold text-ink">{w.title}</p>
            <p className="mt-1 text-sm text-ink/75">{w.text}</p>
          </li>
        ))}
      </ul>

      {siteConfig.features.memberSignup ? (
        <Link href="/login?mode=signup" className="btn-primary mt-8">
          בואי להיות חברה שלנו
        </Link>
      ) : (
        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-[var(--shadow-card)]">
          <span aria-hidden className="size-2 rounded-full bg-gold" />
          המועדון בעבודה. נעדכן כאן כשההרשמה תיפתח
        </p>
      )}
    </section>
  );
}
