import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

const steps = [
  { n: "1", title: "מצטרפות בחינם", text: "נרשמות בדקה, בלי כרטיס אשראי." },
  { n: "2", title: "לוחצות על קוד קופון", text: "בכל הטבה מקבלות קוד קופון להעתקה." },
  { n: "3", title: "מממשות אצל העסק", text: "מראות או מקלידות את הקוד אצל העסק, לפי התנאים שלו." },
] as const;

/** Three plain steps that explain the club to someone who has never seen it. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how">
      <SectionHeading id="how" title="איך זה עובד?" subtitle="שלושה צעדים וזהו" />
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((s) => (
          <li
            key={s.n}
            className="rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)] sm:rounded-[var(--radius-card)] sm:p-5"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft font-display text-base font-bold text-accent sm:size-9 sm:text-lg">
              {s.n}
            </span>
            <h3 className="mt-2 text-sm leading-snug text-ink sm:mt-3 sm:text-lg">{s.title}</h3>
            <p className="mt-1 text-xs leading-snug text-ink-soft sm:text-sm">{s.text}</p>
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
