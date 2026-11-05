import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";

/**
 * "Share to the WhatsApp group" for admins only: opens WhatsApp with the offer's text and its own
 * link (which has its own picture and title when pasted into WhatsApp). Nobody else sees it.
 */
export async function AdminShare({
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
  const session = await getSession();
  if (session?.profile.role !== "admin") return null;
  const url = `${siteConfig.url.replace(/\/$/, "")}${path}`;
  const href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? `inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-surface hover:bg-ink/85 ${className}`
          : `btn-secondary w-full py-2.5 text-[15px] ${className}`
      }
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
      </svg>
      {compact ? "שיתוף בקבוצה (מנהלת)" : "שיתוף בקבוצת הוואטסאפ (מנהלת)"}
    </a>
  );
}
