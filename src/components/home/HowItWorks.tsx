import Image from "next/image";
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
      <ol className="grid grid-cols-3 gap-2 pt-12 sm:gap-4 sm:pt-16 lg:px-28">
        {steps.map((s) => (
          <li key={s.n} className="relative">
            {/* Liky in three poses: the images sit behind the card (z-0), so the seated one really sits on its edge. */}
            {s.n === "1" && (
              <Image
                src="/brand/liky-boxes.webp"
                alt=""
                width={369}
                height={700}
                sizes="6rem"
                className="pointer-events-none absolute bottom-0 left-full ml-2 hidden h-44 w-auto lg:block"
              />
            )}
            {s.n === "2" && (
              <Image
                src="/brand/liky-sitting.webp"
                alt=""
                width={421}
                height={700}
                sizes="6rem"
                className="pointer-events-none absolute bottom-full right-3 z-0 h-24 w-auto translate-y-[46%] sm:right-5 sm:h-32 lg:h-36"
              />
            )}
            {s.n === "3" && (
              <Image
                src="/brand/liky-pointing.webp"
                alt=""
                width={311}
                height={700}
                sizes="6rem"
                className="pointer-events-none absolute bottom-0 right-full mr-2 hidden h-44 w-auto lg:block"
              />
            )}
            <div className="relative z-10 h-full rounded-2xl bg-surface p-3 shadow-[var(--shadow-card)] sm:rounded-[var(--radius-card)] sm:p-5 max-sm:flex max-sm:flex-col max-sm:items-center max-sm:py-4 max-sm:text-center">
            <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft font-display text-base font-bold text-accent sm:size-9 sm:text-lg">
              {s.n}
            </span>
            <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink sm:mt-3 sm:text-lg">{s.title}</h3>
            <p className="mt-1 hidden text-sm leading-snug text-ink-soft sm:block">{s.text}</p>
            </div>
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
