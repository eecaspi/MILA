"use client";

import { useState } from "react";

export interface NowTab {
  id: string;
  label: string;
  node: React.ReactNode;
}

/** Tabs for "מה שווה עכשיו?": the content of every tab comes ready from the server. */
export function NowTabs({ tabs }: { tabs: NowTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  if (tabs.length === 0) return null;
  return (
    <div>
      <div role="tablist" aria-label="מה שווה עכשיו" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`now-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`now-panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === t.id
                ? "border-accent bg-accent text-on-accent"
                : "border-line bg-surface text-ink-soft hover:border-accent/40 hover:text-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`now-panel-${t.id}`}
          aria-labelledby={`now-tab-${t.id}`}
          hidden={active !== t.id}
        >
          {t.node}
        </div>
      ))}
    </div>
  );
}
