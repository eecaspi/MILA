import { InviteWelcome } from "@/components/layout/InviteWelcome";
import { EntryPopup } from "@/components/layout/EntryPopup";
import { getPopup } from "@/lib/data/popup";
import { Tracker } from "@/components/analytics/Tracker";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const popup = await getPopup();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        דילוג לתוכן
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
      <InviteWelcome />
      {popup && <EntryPopup popup={popup} />}
      <Tracker />
    </>
  );
}
