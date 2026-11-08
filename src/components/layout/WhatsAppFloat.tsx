import { siteConfig } from "@/config/site";

/** A floating WhatsApp button with a short label: "contact us about anything". */
export function WhatsAppFloat() {
  const url = siteConfig.community.whatsappUrl;
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="פנייה אלינו בוואטסאפ, על כל דבר"
      className="fixed bottom-4 end-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-2 pe-4 ps-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:brightness-95 sm:bottom-6 sm:end-6 sm:py-2.5 sm:text-base"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 fill-current sm:size-7">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.04-1.32A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.13 15.07l-.3-.18-2.99.78.8-2.91-.2-.31A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 4.2c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.12.17 1.76 2.8 4.34 3.8 2.14.84 2.58.67 3.04.63.47-.04 1.5-.61 1.71-1.2.21-.6.21-1.1.15-1.2-.06-.11-.23-.17-.48-.3-.25-.12-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.12-.17.25-.65.82-.8.99-.15.17-.3.19-.55.06-.25-.12-1.07-.4-2.03-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.37-.78-1.87-.2-.48-.4-.42-.57-.43h-.48Z" />
      </svg>
      <span>פני אלינו על כל דבר</span>
    </a>
  );
}
