import { siteConfig } from "@/config/site";

/** "Send to a friend" through WhatsApp: a plain link that opens WhatsApp with the text and page URL. */
export function ShareButton({
  path,
  text,
  compact = false,
  className = "",
}: {
  path: string;
  text: string;
  compact?: boolean;
  className?: string;
}) {
  const url = `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלחי לחברה בוואטסאפ"
      className={
        compact
          ? `inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-accent hover:bg-accent-soft ${className}`
          : `btn-secondary w-full py-2.5 text-[15px] ${className}`
      }
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
      </svg>
      {compact ? "שלחי לחברה" : "שלחי לחברה בוואטסאפ"}
    </a>
  );
}
