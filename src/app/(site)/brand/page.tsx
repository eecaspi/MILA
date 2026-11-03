import type { Metadata } from "next";
import { HeartMark } from "@/components/brand/HeartMark";
import { LikeyCharacter } from "@/components/brand/LikeyCharacter";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "המותג",
  robots: { index: false, follow: false },
};

const palette = [
  { name: "סגול מלכותי", role: "כפתורים, קישורים, לוגו", hex: "#5C2A7E", text: "#FFFDF9" },
  { name: "סגול עמוק", role: "מעבר עכבר ולחיצה", hex: "#47205F", text: "#FFFDF9" },
  { name: "ערפל לילך", role: "הדגשות עדינות, תגיות", hex: "#ECE2F3", text: "#2B1D33" },
  { name: "שמנת", role: "רקע האתר", hex: "#FAF6EF", text: "#2B1D33" },
  { name: "שנהב", role: "כרטיסים", hex: "#FFFDF9", text: "#2B1D33" },
  { name: "זהב שמפניה", role: "פרטים עדינים בלבד", hex: "#C4A062", text: "#2B1D33" },
  { name: "חציל עמוק", role: "טקסט, פוטר, קהילה", hex: "#2B1D33", text: "#FFFDF9" },
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

function Panel({
  title,
  dark,
  children,
}: {
  title: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-[var(--radius-card)] p-6 ${dark ? "bg-ink" : "bg-surface shadow-[var(--shadow-card)]"}`}
    >
      <p className={`text-xs font-bold ${dark ? "text-white/60" : "text-ink-soft"}`}>{title}</p>
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
          לייקי בהשראת המילה לב. הסמל הוא לב רך עם חור עגול קטן, כמו בתווית מחיר: אכפתיות ומציאה
          ששווה לשתף, בסימן אחד. הצבעים – סגול מלכותי ושמנת, עם נגיעות זהב.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl text-ink">גרסאות הלוגו</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="ראשי – על רקע בהיר">
            <Logo variant="primary" />
          </Panel>
          <Panel title="ראשי – על רקע כהה" dark>
            <Logo variant="primary" onDark />
          </Panel>
          <Panel title="עם הסלוגן – על רקע בהיר">
            <Logo variant="slogan" />
          </Panel>
          <Panel title="עם הסלוגן – על רקע כהה" dark>
            <Logo variant="slogan" onDark />
          </Panel>
          <Panel title="קומפקטי (כותרת האתר)">
            <Logo variant="compact" />
          </Panel>
          <Panel title="סמל בלבד">
            <div className="flex items-center gap-6">
              <Logo variant="icon" />
              <span className="flex size-16 items-center justify-center rounded-2xl bg-accent">
                <HeartMark size={36} color="#ffffff" />
              </span>
              <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft">
                <HeartMark size={34} />
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

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl text-ink">טיפוגרפיה</h2>
          <p className="font-display text-4xl font-bold text-ink">פרנק רוהל לכותרות</p>
          <p className="text-lg text-ink">
            היבו לטקסט רץ – קריא, נקי ונעים בעברית, גם בטלפון וגם בגדלים קטנים.
          </p>
          <h3 className="pt-4 text-xl text-ink">קול המותג</h3>
          <ul className="space-y-1 text-ink-soft">
            <li>&quot;בואי לראות מה שווה&quot; במקום &quot;צפייה במבצעים&quot;</li>
            <li>&quot;בואי להיות חברה שלנו&quot; במקום &quot;הצטרפות למועדון&quot;</li>
            <li>&quot;לייקי מצאה לך&quot; במקום &quot;מבצעים מומלצים&quot;</li>
            <li>&quot;מה בא לך למצוא היום?&quot; במקום &quot;כל הקטגוריות&quot;</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl text-ink">מקום לדמות של לייקי</h2>
          <p className="text-ink-soft">
            מסגרת קבועה (4:5) שמחכה לדמות הסופית. כשהיא תהיה מוכנה, מחליפים רק את התמונה.
          </p>
          <LikeyCharacter className="max-w-[16rem]" />
        </div>
      </section>
    </div>
  );
}
