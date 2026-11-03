import type { CategoryTone } from "@/lib/types";

/**
 * Full class names per tone (Tailwind needs literal strings to generate them).
 * `solid` = pastel fill with near-black text; `text` = pastel text on dark.
 */
export const toneClasses: Record<CategoryTone, { solid: string; text: string; ring: string }> = {
  rose: {
    solid: "bg-tone-rose text-on-accent",
    text: "text-tone-rose",
    ring: "border-tone-rose/40",
  },
  peach: {
    solid: "bg-tone-peach text-on-accent",
    text: "text-tone-peach",
    ring: "border-tone-peach/40",
  },
  lilac: {
    solid: "bg-tone-lilac text-on-accent",
    text: "text-tone-lilac",
    ring: "border-tone-lilac/40",
  },
  mint: {
    solid: "bg-tone-mint text-on-accent",
    text: "text-tone-mint",
    ring: "border-tone-mint/40",
  },
  sky: { solid: "bg-tone-sky text-on-accent", text: "text-tone-sky", ring: "border-tone-sky/40" },
  sand: {
    solid: "bg-tone-sand text-on-accent",
    text: "text-tone-sand",
    ring: "border-tone-sand/40",
  },
  coral: {
    solid: "bg-tone-coral text-on-accent",
    text: "text-tone-coral",
    ring: "border-tone-coral/40",
  },
  pearl: {
    solid: "bg-tone-pearl text-on-accent",
    text: "text-tone-pearl",
    ring: "border-tone-pearl/40",
  },
};
