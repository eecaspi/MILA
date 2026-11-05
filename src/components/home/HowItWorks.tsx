import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

const steps = [
  { n: "1", title: "מצטרפות בחינם", text: "נרשמות בדקה, בלי כרטיס אשראי." },
  { n: "2", title: "לוחצות על קוד קופון", text: "בכל הטבה מקבלות קוד אישי, תקף ל־24 שעות." },
  { n: "3", title: "מממשות אצל העסק", text: "מראות או מקלידות את הקוד אצל העסק, לפי התנאים שלו." },
] as const;

/** Three plain steps that explain the club to someone who has never seen it. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how">
      <SectionHeading id="how" title="איך זה עובד?" subtitle="שלושה צעדים וזהו" />
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="rounded-[var(--radius-card)] bg-surface p-5 shadow-[var(--shadow-card)]"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft font-display text-lg font-bold text-accent">
              {s.n}
            </span>
            <h3 className="mt-3 text-lg text-ink">{s.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>
      {siteConfig.features.memberSignup && (
        <p className="mt-5 text-center">
          <Link href="/login?mode=signup" className="btn-primary">
            אני רוצה להצטרף
          </Link>
        </p>
      )}
    </section>
  );
}
