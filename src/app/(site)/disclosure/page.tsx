import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, LegalPage, Section } from "@/components/legal/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "גילוי נאות",
  description: `איך ${siteConfig.brand.name} פועלת מול העסקים, ומתי ייתכן שיש לנו עמלה.`,
};

export default function Disclosure() {
  return (
    <LegalPage title="גילוי נאות">
      <Section title="מי אנחנו מול העסקים">
        <p>
          {siteConfig.brand.name} היא אתר מידע והמלצות. אנחנו לא מוכרות מוצרים, והרכישה נעשית ישירות
          מול העסק.
        </p>
      </Section>

      <Section title="עסקים ללא קשר מסחרי">
        <p>
          בשלב ההרצה, חלק מהעסקים מוצגים באתר על סמך מידע פומבי, ובלי הסכם או אישור מצדם. הם לא שילמו
          על ההצגה, ואין בה המלצה או אישור מטעמם.
        </p>
      </Section>

      <Section title="עמלות וקישורי שותפים">
        <p>
          ייתכן שבהמשך נקבל עמלה או תגמול מעסקים על רכישות שנעשו דרך קישורים באתר. כשיש קשר כזה, אנחנו
          נציין זאת בבירור ליד ההצעה. העמלה אינה מייקרת את המחיר שלך.
        </p>
      </Section>

      <Section title="הצעות לדוגמה">
        <p>הצעות שמסומנות &quot;לדוגמה&quot; שייכות לעסקים פיקטיביים ואינן ניתנות למימוש.</p>
      </Section>

      <Section title="ההטבות והקודים">
        <p>
          ההטבות וקודי הקופון שייכים לעסקים ובאחריותם, ואנחנו לא יכולות להבטיח שהעסק יכבד אותם.
          פרטים ב<Link href="/terms">תנאי השימוש</Link>.
        </p>
      </Section>

      <Section title="תיקונים ובקשות">
        <p>
          מצאת טעות, או שאת בעלת עסק ורוצה לעדכן או להסיר את פרטי העסק? כתבי אל <ContactEmail />.
        </p>
      </Section>
    </LegalPage>
  );
}
