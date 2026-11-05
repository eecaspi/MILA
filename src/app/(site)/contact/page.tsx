import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "יצירת קשר",
  description: "בעלי עסקים, או מי שנתקלה בבעיה באתר? אנחנו כאן.",
};

const options = [
  {
    href: "/for-businesses",
    icon: "🏪",
    title: "אני בעל/ת עסק",
    text: "רוצים שליקי תספר על העסק שלכם? השאירו פרטים ונחזור אליכם עם כל המידע.",
    cta: "להשארת פרטים",
  },
  {
    href: "/report-problem",
    icon: "🛠️",
    title: "נתקלתי בבעיה באתר",
    text: "משהו לא עובד, לא מובן או נראה לא נכון? ספרו לנו ונטפל בזה.",
    cta: "לדיווח על בעיה",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <p className="eyebrow">צור קשר</p>
        <h1 className="mt-1 text-3xl text-ink md:text-4xl">איך אפשר לעזור?</h1>
        <p className="mt-2 text-ink-soft">בחרו את הנושא ונחזור אליכם בהקדם.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.href}>
            <Link
              href={o.href}
              className="lift flex h-full flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] hover:ring-2 hover:ring-accent/30"
            >
              <span aria-hidden className="text-3xl">
                {o.icon}
              </span>
              <span className="font-display text-xl font-bold text-ink">{o.title}</span>
              <span className="text-ink-soft">{o.text}</span>
              <span className="mt-auto pt-2 font-semibold text-accent">{o.cta} ←</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
