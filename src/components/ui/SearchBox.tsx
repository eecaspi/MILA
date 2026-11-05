import { useId } from "react";

/**
 * The search box: a big round field with a button, and suggestions that appear while typing
 * (business names, categories, tags, offer titles). Works without JavaScript.
 */
export function SearchBox({
  suggestions,
  defaultValue,
  hidden = {},
  raised = false,
}: {
  suggestions: string[];
  defaultValue?: string;
  /** Filters to keep when searching, as hidden fields. */
  hidden?: Record<string, string | undefined>;
  /** White field with a soft shadow (for use on the pink page). */
  raised?: boolean;
}) {
  const listId = useId();
  return (
    <form action="/deals" role="search" className="flex gap-2">
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        maxLength={60}
        list={listId}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="מה מחפשים? למשל: פאות, בגדי ילדים, תכשיטים"
        aria-label="חיפוש הטבות ועסקים"
        className={`min-w-0 flex-1 rounded-full border-2 border-line px-5 py-3.5 text-base text-ink outline-none placeholder:text-ink-soft/60 focus:border-accent md:text-lg ${
          raised ? "bg-surface shadow-[var(--shadow-card)]" : "bg-canvas"
        }`}
      />
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <button type="submit" className="btn-primary px-7">
        חיפוש
      </button>
    </form>
  );
}
