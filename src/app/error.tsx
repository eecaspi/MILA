"use client";

import { TagMark } from "@/components/brand/TagMark";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <TagMark size={80} />
      <h1 className="mt-6 text-3xl text-ink">משהו השתבש</h1>
      <p className="mt-3 text-ink-soft">זה לא קרה בגללך. אפשר לנסות שוב בעוד רגע.</p>
      <button type="button" onClick={reset} className="btn-primary mt-8">
        ניסיון נוסף
      </button>
    </main>
  );
}
