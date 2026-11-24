import { contractSections, type ContractTerms } from "@/lib/contracts/template";

export function ContractText({ terms }: { terms: ContractTerms }) {
  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-ink">
      {contractSections(terms).map((s) => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-ink">{s.title}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-2">
              {p}
            </p>
          ))}
          {s.bullets && (
            <ul className="mt-2 list-disc space-y-1.5 ps-5">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
