import type { Metadata } from "next";
import { TagMark } from "@/components/brand/TagMark";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "המותג",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "אדום התיק", role: "כפתורים, קישורים והלוגו", hex: "#C4050B", text: "#FFFFFF" },
  { name: "אדום כהה", role: "מעבר עכבר ולחיצה", hex: "#A30409", text: "#FFFFFF" },
  { name: "סומק", role: "הדגשות רכות ורקעים", hex: "#FDE8E8", text: "#3F1D20" },
  { name: "ורוד עדין", role: "פרטים ואפקטים", hex: "#EEB1B5", text: "#3F1D20" },
  { name: "שמנת", role: "רקע האתר", hex: "#FFF8F7", text: "#3F1D20" },
  { name: "לבן", role: "כרטיסים", hex: "#FFFFFF", text: "#3F1D20" },
  { name: "יין כהה", role: "טקסט וכותרות", hex: "#3F1D20", text: "#FFFFFF" },
];

const tones = ["rose", "peach", "lilac", "mint", "sky", "sand", "coral", "pearl"] as const;
const toneBg: Record<(typeof tones)[number], string> = {
  rose: "bg-tone-rose",
  peach: "bg-tone-peach",
  lilac: "bg-tone-lilac",
  mint: "bg-tone-mint",
  sky: "bg-tone-sky",
  sand: "bg-tone-sand",
  coral: "bg-tone-coral",
  pearl: "bg-tone-pearl",
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-bold text-ink-soft">{title}</p>
      <div className="flex min-h-24 items-center">{children}</div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <header>
        <p className="eyebrow">שפת המותג</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">
          {siteConfig.brand.name} – {siteConfig.brand.slogan}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          הלוגו הרשמי: תיק קניות אדום עם השם Liky, שרשרת קטנה בתוך ה־k (הקישור שליקי מוצאת
          בשבילך) והסלוגן &quot;יש לי קישור בשבילך&quot;. כל האתר בנוי מהצבעים של הלוגו: אדום
          התיק, סומק ורוד ולבן.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl text-ink">גרסאות הלוגו</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="הלוגו המלא – על רקע בהיר">
            <Logo variant="full" height={170} />
          </Panel>
          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-accent-soft p-6">
            <p className="text-xs font-bold text-ink-soft">הלוגו המלא – על רקע סומק</p>
            <div className="flex min-h-24 items-center">
              <Logo variant="full" height={170} />
            </div>
          </div>
          <Panel title="קומפקטי (כותרת האתר)">
            <Logo variant="wordmark" height={48} />
          </Panel>
          <Panel title="סמל בלבד">
            <div className="flex items-center gap-6">
              <Logo variant="icon" height={64} />
              <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft">
                <TagMark size={44} />
              </span>
            </div>
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl text-ink">צבעים</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {palette.map((c) => (
            <li
              key={c.hex}
              className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]"
            >
              <div
                className="flex h-24 items-end p-3 text-xs font-bold"
                style={{ background: c.hex, color: c.text }}
              >
                <span className="ltr">{c.hex}</span>
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-ink">{c.name}</p>
                <p className="text-xs text-ink-soft">{c.role}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-soft">גווני הקטגוריות – פסטלים רכים, תמיד עם טקסט כהה:</p>
        <ul className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <li key={t} className={`h-10 w-16 rounded-xl ${toneBg[t]}`} />
          ))}
        </ul>
      </section>

      <section className="grid gap-8 md:grid-cols-1">
        <div className="space-y-3">
          <h2 className="text-2xl text-ink">טיפוגרפיה</h2>
          <p className="text-4xl font-extrabold text-ink">היבו – גופן אחד לכל האתר</p>
          <p className="text-lg text-ink">
            כותרות בהדגשה, טקסט רץ במשקל רגיל – קריא, נקי ונעים בעברית, גם בטלפון.
          </p>
          <h3 className="pt-4 text-xl text-ink">קול המותג</h3>
          <ul className="space-y-1 text-ink-soft">
            <li>&quot;בואי לראות מה שווה&quot; במקום &quot;צפייה במבצעים&quot;</li>
            <li>&quot;בואי להיות חברה שלנו&quot; במקום &quot;הצטרפות למועדון&quot;</li>
            <li>&quot;ליקי מצאה לך&quot; במקום &quot;מבצעים מומלצים&quot;</li>
            <li>&quot;מה בא לך למצוא היום?&quot; במקום &quot;כל הקטגוריות&quot;</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
