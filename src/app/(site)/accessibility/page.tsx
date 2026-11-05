import type { Metadata } from "next";
import { ContactEmail, LegalPage, Section } from "@/components/legal/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: `הצהרת הנגישות של ${siteConfig.brand.name}.`,
};

const { legal, brand } = siteConfig;

export default function Accessibility() {
  return (
    <LegalPage title="הצהרת נגישות">
      <p>
        {brand.name} רוצה שכל אחת תוכל להשתמש באתר בנוחות ובעצמאות, ופועלת להתאים אותו לאנשים עם
        מוגבלות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ולתקנות הנגישות לשירות.
      </p>

      <Section title="מה עשינו">
        <ul>
          <li>האתר בנוי בעברית מימין לשמאל, עם מבנה כותרות ברור.</li>
          <li>ניתן לנווט בו עם המקלדת, והאלמנטים האינטראקטיביים מסומנים בבירור.</li>
          <li>לתמונות יש טקסט חלופי, ולשדות הטפסים יש תוויות.</li>
          <li>צבעי הטקסט והרקע נבחרו ליצור ניגודיות קריאה.</li>
          <li>האתר מתאים לגלישה בנייד ובמחשב, וניתן להגדיל בו את הטקסט.</li>
        </ul>
      </Section>

      <Section title="מגבלות">
        <p>
          אנחנו ממשיכות לשפר. ייתכן שחלק מהעמודים או התכנים, ובעיקר תמונות ותכנים שמגיעים מעסקים,
          עדיין אינם נגישים במלואם. התאמות האתר טרם נבדקו על ידי בודק נגישות מוסמך.
        </p>
      </Section>

      <Section title="רכזת נגישות ופניות">
        <p>
          נתקלת בקושי? רוצה לבקש התאמה או חלופה לתוכן? פני אל רכזת הנגישות, {legal.accessibilityCoordinator},
          במייל <ContactEmail />. נשמח לקבל פירוט של הבעיה ושל הכתובת בעמוד, ונטפל בהקדם.
        </p>
      </Section>

      <Section title="תאריך עדכון">
        <p>ההצהרה עודכנה בתאריך {legal.lastUpdated}.</p>
      </Section>
    </LegalPage>
  );
}
