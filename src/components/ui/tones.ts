import type { CategoryTone } from "@/lib/types";

/** Pastel fill + ink text per tone. Literal strings so Tailwind generates them. */
export const toneClasses: Record<CategoryTone, string> = {
  rose: "bg-tone-rose text-ink",
  peach: "bg-tone-peach text-ink",
  lilac: "bg-tone-lilac text-ink",
  mint: "bg-tone-mint text-ink",
  sky: "bg-tone-sky text-ink",
  sand: "bg-tone-sand text-ink",
  coral: "bg-tone-coral text-ink",
  pearl: "bg-tone-pearl text-ink",
};
