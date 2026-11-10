"use client";

import { useRef } from "react";

/** A link-style button that opens the full branch list in a popup. */
export function BranchesDialog({ branches, name }: { branches: string[]; name: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="font-semibold text-accent hover:underline"
      >
        לרשימת הסניפים
      </button>
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[min(92vw,26rem)] rounded-[var(--radius-card)] bg-surface p-0 text-ink shadow-[var(--shadow-card)] backdrop:bg-black/50"
      >
        <div className="flex max-h-[80dvh] flex-col p-5">
          <p className="mb-3 font-display text-lg font-bold">הסניפים של {name}</p>
          <ul className="space-y-2 overflow-y-auto text-sm">
            {branches.map((b) => (
              <li key={b} className="border-b border-line pb-2 last:border-0">
                {b}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => ref.current?.close()} className="btn-secondary mt-4 w-full">
            סגירה
          </button>
        </div>
      </dialog>
    </>
  );
}
