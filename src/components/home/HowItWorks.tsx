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
      <ol className="grid grid-cols-3 gap-2 pt-16 sm:gap-4 sm:pt-20 xl:pl-[14rem] xl:pr-32 xl:pt-32">
        {steps.map((s) => (
          <li key={s.n} className="relative">
            {/* Liky holds the step's number. Wide screens: 1 and 3 stand beside the cards, 2 sits on the middle card. */}
            {s.n === "1" && (
              <Image
                src="/brand/liky-num-1.webp"
                alt="ליקי ליד הספרה 1"
                width={444}
                height={800}
                sizes="9rem"
                className="pointer-events-none absolute bottom-0 left-full ml-2.5 hidden h-[150px] w-auto xl:block"
              />
            )}
            {s.n === "2" && (
              <Image
                src="/brand/liky-num-2.webp"
                alt="ליקי יושבת עם הספרה 2"
                width={418}
                height={800}
                sizes="8rem"
                className="pointer-events-none absolute bottom-full right-3 z-20 h-28 w-auto translate-y-[34%] sm:right-6 sm:h-36 xl:right-6 xl:h-[184px]"
              />
            )}
            {s.n === "3" && (
              <Image
                src="/brand/liky-num-3.webp"
                alt="ליקי דוחפת את הספרה 3"
                width={800}
                height={583}
                sizes="14rem"
                className="pointer-events-none absolute bottom-0 right-full mr-1 hidden h-[122px] w-auto xl:block"
              />
            )}
            <div
              className={`relative z-10 flex h-full flex-col justify-center rounded-2xl bg-surface p-3 text-center shadow-[var(--shadow-card)] sm:rounded-[var(--radius-card)] sm:p-5 max-sm:items-center max-sm:py-4 xl:min-h-[9.5rem] ${
                s.n === "2" ? "pt-10 sm:pt-12 xl:justify-end xl:pt-5" : ""
              }`}
            >
              {s.n !== "2" && (
                <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-accent-soft font-display text-base font-bold text-accent sm:size-9 sm:text-lg xl:hidden">
                  {s.n}
                </span>
              )}
              <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink sm:mt-3 sm:text-lg xl:mt-0">{s.title}</h3>
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
