import { InviteLinkMaker } from "@/components/admin/InviteLinkMaker";

export const metadata = { title: "קישורי הזמנה" };

export default function InvitesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-ink">קישורי הזמנה</h1>
      <p className="max-w-xl text-ink-soft">
        כותבות שם בכל שורה, מעתיקות את הקישור של כל לקוח ושולחות. מי שנכנס מהקישור רואה ברכת קבלה אישית עם השם בכל כניסה חדשה לאתר, עד שנפתח אותו סופית. האתר עצמו נשאר פתוח לכולן.
      </p>
      <InviteLinkMaker />
    </div>
  );
}
