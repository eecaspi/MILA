import { InviteLinkMaker } from "@/components/admin/InviteLinkMaker";

export const metadata = { title: "קישורי הזמנה" };

export default function InvitesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-ink">קישורי הזמנה</h1>
      <p className="max-w-xl text-ink-soft">
        כותבות שם, מעתיקות את הקישור ושולחות. מי שנכנסת מהקישור רואה ברכת קבלה אישית עם השם, פעם אחת בלבד. האתר עצמו נשאר פתוח לכולן.
      </p>
      <InviteLinkMaker />
    </div>
  );
}
