import { contractSections, type ContractTerms } from "@/lib/contracts/template";

function split(title: string): { num: string; text: string } {
  const m = title.match(/^(\d+)\.\s*(.*)$/);
  return m ? { num: m[1], text: m[2] } : { num: "", text: title };
}

export function ContractText({ terms }: { terms: ContractTerms }) {
  return (
    <div className="text-[15px] leading-relaxed text-ink">
      {contractSections(terms).map((s, i) => {
        const { num, text } = split(s.title);
        return (
          <section key={s.title} className={i === 0 ? "" : "mt-6 border-t border-line pt-6"}>
            <h2 className="flex items-center gap-3 text-lg font-bold text-ink">
              {num && (
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent"
                >
                  {num}
                </span>
              )}
              <span>{text}</span>
            </h2>
            <div className={num ? "sm:ps-11" : ""}>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mt-3">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
