import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, LegalPage, Section } from "@/components/legal/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: `הצהרת הנגישות של ${siteConfig.brand.name}.`,
};

const { brand } = siteConfig;

export default function Accessibility() {
  return (
    <LegalPage title="הצהרת נגישות">
      <p>
        {brand.name} רוצה שכל אחת תוכל להשתמש באתר בנוחות ובעצמאות, והתאימה אותו לאנשים עם
        מוגבלות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ולתקנות הנגישות לשירות.
      </p>

      <Section title="רמת הנגישות">
        <p>
          האתר מותאם לתקן הישראלי לנגישות אתרי אינטרנט (ת&quot;י 5568), בהתאם להנחיות WCAG ברמה AA. האתר נבדק
          במגוון דפדפנים ומכשירים, במחשב ובנייד.
        </p>
      </Section>

      <Section title="מה עשינו">
        <ul>
          <li>האתר בנוי בעברית מימין לשמאל, עם מבנה כותרות ברור.</li>
          <li>ניתן לנווט בו עם המקלדת, והאלמנטים האינטראקטיביים מסומנים בבירור.</li>
          <li>לתמונות יש טקסט חלופי, ולשדות הטפסים יש תוויות.</li>
          <li>צבעי הטקסט והרקע נבחרו ליצור ניגודיות קריאה.</li>
          <li>האתר מתאים לגלישה בנייד ובמחשב, וניתן להגדיל בו את הטקסט.</li>
          <li>יש קישור &quot;דילוג לתוכן&quot; בראש כל עמוד.</li>
          <li>את הבאנרים הנעים בראש האתר אפשר לעצור בלחיצה על כפתור ההשהיה.</li>
          <li>למי שהגדירה במכשיר צמצום תנועה, האנימציות והסרטונים המתנגנים לא יופעלו.</li>
        </ul>
      </Section>

      <Section title="חלופות לתוכן">
        <p>
          אם תוכן מסוים אינו נגיש לך, נשמח לספק את המידע בדרך חלופית לפי בקשה, למשל בטלפון, בהודעה או בתיאור
          בכתב של התוכן.
        </p>
      </Section>

      <Section title="רכזת נגישות ופניות">
        <p>
          נתקלת בקושי? רוצה לבקש התאמה או חלופה לתוכן? פני אל רכזת הנגישות דרך{" "}
          <Link href="/report-problem?page=accessibility">טופס הפנייה</Link> או במייל <ContactEmail />. נשמח לקבל פירוט של
          הבעיה ושל הכתובת בעמוד, ונטפל בהקדם.
        </p>
      </Section>

      <Section title="תאריך עדכון">
        <p>ההצהרה עודכנה בתאריך 14 בנובמבר 2026.</p>
      </Section>
    </LegalPage>
  );
}
