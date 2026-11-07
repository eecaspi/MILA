const steps = [
  { title: "קוד קופון אישי", text: "כל חברה במועדון תקבל קוד קופון משלה." },
  { title: "משתפות", text: "משתפות את הקוד עם חברות, משפחה וקהילה." },
  { title: "מרוויחות", text: "כשהקוד שלך בשימוש, את מרוויחה." },
];

/** Shown instead of the points numbers while the program is off, so nothing looks active. */
export function RewardsComingSoon() {
  return (
    <section aria-labelledby="soon" className="space-y-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="soon" className="text-2xl text-ink">
          נקודות ושיתוף: בקרוב
        </h2>
        <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-on-accent">
          עוד לא פעיל
        </span>
      </div>

      <p className="rounded-2xl bg-accent-soft px-4 py-3 font-semibold text-ink">
        כרגע אין צבירת נקודות ואין צורך לעשות כלום. כל ההטבות באתר פתוחות לכולן.
      </p>

      <div className="space-y-3">
        <p className="text-ink-soft">מה מתוכנן בעתיד:</p>
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-start gap-3 rounded-2xl border border-line bg-raised p-4">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-ink">{s.title}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-sm text-ink-soft">
        נעדכן כאן ובקהילה כשזה יתחיל. עד אז, אין נקודות וחשבון הנקודות לא פעיל.
      </p>
    </section>
  );
}
