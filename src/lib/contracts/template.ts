import { siteConfig } from "@/config/site";

export const CONTRACT_VERSION = "2026-11-v1";

/** Values the team sets per business when it creates a contract link. */
export interface ContractTerms {
  commissionPercent: number;
  vat: "without" | "with";
  paymentDays: number;
  reportPeriod: "monthly" | "biweekly";
  noticeDays: number;
  term: string;
  exposure: string;
  courtCity: string;
}

/** Details the business fills in on the contract page (Appendix A). */
export interface ContractFields {
  legalName: string;
  companyId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  places: string;
  offer: string;
  validity: string;
  restrictions: string;
  redemption: string;
}

export const FIELD_LABELS: Record<keyof ContractFields, string> = {
  legalName: "שם עסק / מותג",
  companyId: "שם משפטי ומספר ח.פ. / ע.מ.",
  contactName: "איש קשר",
  contactPhone: "טלפון",
  contactEmail: "מייל",
  places: "כתובת אתר או סניפים למימוש",
  offer: "ההטבה (למשל: 20% הנחה על ...)",
  validity: "תוקף ההטבה (מתאריך עד תאריך)",
  restrictions: "מוצרים והגבלות (אם יש)",
  redemption: "אופן השימוש בקופון (קוד / קישור / אחר)",
};

export function parseTerms(value: unknown): ContractTerms | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const commissionPercent = Number(v.commissionPercent);
  const paymentDays = Number(v.paymentDays);
  const noticeDays = Number(v.noticeDays);
  if (!Number.isFinite(commissionPercent) || commissionPercent <= 0 || commissionPercent > 100) return null;
  if (!Number.isInteger(paymentDays) || paymentDays < 0 || paymentDays > 180) return null;
  if (!Number.isInteger(noticeDays) || noticeDays < 0 || noticeDays > 180) return null;
  return {
    commissionPercent,
    vat: v.vat === "with" ? "with" : "without",
    paymentDays,
    reportPeriod: v.reportPeriod === "biweekly" ? "biweekly" : "monthly",
    noticeDays,
    term: String(v.term ?? "").slice(0, 200),
    exposure: String(v.exposure ?? "").slice(0, 300),
    courtCity: String(v.courtCity ?? "").slice(0, 60),
  };
}

export interface ContractSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

/** The contract text. One template for everyone; only the values above change. */
export function contractSections(t: ContractTerms): ContractSection[] {
  const { operatorName, companyId } = siteConfig.legal;
  const vat = t.vat === "with" ? "כולל מע״מ" : "לא כולל מע״מ";
  const period = t.reportPeriod === "biweekly" ? "דו־שבועית" : "חודשית";
  const every = t.reportPeriod === "biweekly" ? "לשבועיים" : "לחודש";
  return [
    {
      title: "1. הצדדים והרקע",
      paragraphs: [
        `הסכם זה נערך בין אסתר תחיה לדרמן ואסתי כספי, שמאחוריהן עומד העסק ${operatorName} (ח.פ. ${companyId}), המפעילות את פלטפורמת "ליקי" (להלן: "ליקי"), לבין בית העסק שפרטיו בנספח א' (להלן: "בית העסק").`,
        "ליקי מפעילה פלטפורמה דיגיטלית שמציגה לצרכניות הטבות וקופונים של עסקים, ומפיצה אותם באתר ובערוצי התקשורת שלה. בית העסק מעוניין להציג בפלטפורמה הטבה ללקוחות, ולשלם לליקי עמלה על מכירות שמקורן בה. פרטי בית העסק, ההטבה והעמלה נקבעים בנספח א', והוא חלק בלתי נפרד מההסכם.",
      ],
    },
    {
      title: "2. הגדרות",
      bullets: [
        "ההטבה: הנחה, מבצע או הטבה אחרת שבית העסק מציע לחברות המועדון דרך ליקי, כפי שמפורט בנספח א'.",
        "הקופון: הקוד, הקישור או האמצעי האחר שבאמצעותו לקוחה מממשת את ההטבה אצל בית העסק.",
        "מכירה מיוחסת: עסקה שבה הלקוחה הגיעה לבית העסק בעקבות ליקי ושימשה בקופון, כמוגדר בסעיף 6.",
        "עמלה: האחוז מערך המכירה המיוחסת ששולם לליקי, כמפורט בסעיף 5.",
      ],
    },
    {
      title: "3. ההטבה והקופון",
      bullets: [
        "פרטי ההטבה (שיעור, תוקף, מוצרים, מגבלות ומקום מימוש) נקבעים על ידי בית העסק בנספח א'.",
        `בית העסק רשאי להחליף או להפסיק הטבה בהודעה בכתב לליקי. השינוי יעלה לפלטפורמה בתוך ${t.noticeDays} ימי עסקים. הטבה שהוצגה ללקוחה לפני השינוי תכובד עד תוקפה.`,
        "ההטבה אמיתית ובתוקף לאורך כל התקופה שבה היא מפורסמת.",
      ],
    },
    {
      title: "4. אחריות בית העסק לקופון",
      paragraphs: [
        "האחריות על הקופון ועל ההטבה היא על בית העסק בלבד. ליקי היא פלטפורמת פרסום והפצה בלבד, ואינה צד לעסקה בין בית העסק לבין הלקוחה.",
      ],
      bullets: [
        "בית העסק יכבד את הקופון באופן מלא ובהתאם לתנאי ההטבה שפורסמו, ויטפל בעצמו בכל בעיה ביחס ללקוחה.",
        "בית העסק האחראי היחיד למוצרים ולשירותים, לאיכותם, לאספקה, למחירים, לחשבוניות, להחזרות ולזיכויים, לאחריות ולשירות לאחר המכירה, ולכל עניין הנוגע להסדרים שבינו לבין לקוחותיו.",
        "בית העסק בעל הזכויות במותג ובמוצרים, וההטבה אינה פוגעת בזכויות של אדם אחר או בדין.",
        "בית העסק ישא בכל ההוצאות והנזקים הנובעים מהקופון ומההטבה, וישפה את ליקי ומי מטעמה בגין כל תביעה, הוצאה או נזק שייגרמו להם בקשר לכך, כולל שכר טרחה סביר.",
      ],
    },
    {
      title: "5. עמלה ותשלום",
      bullets: [
        `בית העסק ישלם לליקי עמלה בשיעור ${t.commissionPercent}% מערך כל מכירה מיוחסת, ${vat}.`,
        "אין דמי הצטרפות, דמי ניהול או תשלום על פרסום מראש. התשלום חל רק על מכירות מיוחסות.",
        "העמלה מחושבת לפי מכירות ששולמו בפועל, ולא על עסקאות שבוטלו או שהוחזרו במלואן. בהחזר חלקי תקוזז העמלה בהתאם.",
        `אחת ${every} ליקי תשלח לבית העסק דוח מכירות מיוחסות וחשבונית עמלה, ובית העסק ישלם אותה תוך ${t.paymentDays} ימים מקבלת הדוח, בהעברה בנקאית לחשבון שיודיע לו ליקי בכתב.`,
        "בעיכוב בתשלום יתווספו ריבית והפרשי הצמדה כדין.",
        "שיעור העמלה נקבע לבית העסק בנפרד, ושינוי בו ייעשה בכתב ובהסכמת שני הצדדים בלבד.",
      ],
    },
    {
      title: "6. שיוך מכירות, דיווח ובקרה",
      bullets: [
        "מכירה תיוחס לליקי כשהלקוחה שהגיעה בעקבותיה השתמשה בקופון שהופק דרך ליקי (קוד קופון, קישור ייחודי או אמצעי אחר שסוכם בנספח א') בעת הרכישה או בתוך ימים ספורים מהפעלתו.",
        "בית העסק מתחייב להפעיל את הקופון במערכת המכירות או בקופה שלו ולהשיב לכל שאלה בהקשר לשיוך.",
        `בית העסק ימסור לליקי דוח מכירות מיוחסות אמין ומלא בכל תקופת דיווח (${period}), ויאפשר לליקי לבדוק את נתוני המכירות הרלוונטיים לקופונים, בהודעה מראש ובאופן הנדרש לאימות הדיווח בלבד.`,
        "בהיעדר דיווח, או כשיש ספק בנכונותו, ישמשו נתוני המעקב של ליקי (ניקודי שימוש בקופונים) כראיה לעמלה, אלא אם הוכח אחרת.",
      ],
    },
    {
      title: "7. חשיפה והפצה",
      bullets: [
        t.exposure
          ? `רמת החשיפה שסוכמה: ${t.exposure}.`
          : "ליקי תציג את בית העסק וההטבה בפלטפורמה ותפיץ אותם בערוציה, לפי רמת החשיפה שנקבעה.",
        "היקף החשיפה, המיקומים ותדירות הפרסום נקבעים לפי אטרקטיביות ההטבה, הרלוונטיות לקהל ושיקולי המערכת, וליקי אינה מתחייבת למיקום, למספר חשיפות, למספר קליקים או למכירות.",
        "ליקי רשאית לערוך ולקצר את ניסוח הפרסום בשמירה על המשמעות, ולהוריד תכנים שאינם מתאימים לערכי הקהל שלה.",
      ],
    },
    {
      title: "8. תקופה והפסקה",
      bullets: [
        `ההסכם חל מיום החתימה ו${t.term ? `עד ${t.term}` : "ללא הגבלת זמן"}.`,
        `כל צד רשאי להפסיק את השיתוף בהודעה בכתב של ${t.noticeDays} ימים מראש.`,
        "הפסקה אינה מבטלת חיובים שנוצרו עד מועדה: מכירות שאויחסו לליקי לפני ההפסקה יישארו ברשות עמלה, וקופונים שהופקו וטרם פג תוקפם יכובדו.",
        "ליקי רשאית להסיר את בית העסק או ההטבה מהפלטפורמה במיידי אם ההטבה אינה מכובדת או שהתקבלו תלונות חמורות על השימוש בה.",
      ],
    },
    {
      title: "9. קניין רוחני ושימוש בחומרים",
      bullets: [
        "בית העסק מעניק לליקי רישיון לא בלעדי להשתמש בשמו, בלוגו, בתמונות ובתיאורי המוצרים שמסר, לצורך פרסום ההטבה בלבד, ומצהיר שבידיו הזכויות לכך.",
        "הזכויות בפלטפורמה, בדמות ובעיצוב של ליקי ובתכנים שיצרה נשארות בבעלות ליקי.",
      ],
    },
    {
      title: "10. סודיות ופרטיות",
      bullets: [
        "כל צד ישמור על סודיות המידע העסקי שנחשף אליו מהצד השני (כגון נתוני מכירות ושיעורי עמלה), וישתמש בו רק לצורך ההסכם.",
        "ליקי לא תמסור לבית העסק פרטים אישיים של חברות המועדון, אלא אם הדבר נדרש למימוש הקופון ובכפוף למדיניות הפרטיות שלה.",
        "בית העסק ישתמש בנתוני לקוחות רק לצורך מימוש הקופון, בהתאם לדין.",
      ],
    },
    {
      title: "11. הגבלת אחריות ליקי ושונות",
      bullets: [
        "ליקי אינה מבטיחה מועד מכירות, הכנסה או תוצאה עסקית, ואינה אחראית לנזק הנובע מהפלטפורמה, מהשבתה או מתקלה טכנית, אלא בהיקף שהדין אוסר להגביל.",
        "ההסכם אינו מקנה לבית העסק בלעדיות, ואין בו משום יחסי שירות, שותפות או העסקה בין הצדדים.",
        "ההסכם והנספח משקללים את כל הסכמות הצדדים, ושינוי בהם ייעשה בכתב ובחתימת שני הצדדים בלבד.",
        `ההסכם חל עליו הדין הישראלי. בית המשפט המוסמך ב${t.courtCity || "[עיר]"} יהיה בלעדי לדון בכל מחלוקת הנובעת מההסכם.`,
      ],
    },
  ];
}

/** Plain text of the whole agreement as signed: hashed with the signature. */
export function contractPlainText(t: ContractTerms, fields: ContractFields): string {
  const lines: string[] = [];
  for (const s of contractSections(t)) {
    lines.push(s.title);
    for (const p of s.paragraphs ?? []) lines.push(p);
    for (const b of s.bullets ?? []) lines.push(`- ${b}`);
  }
  lines.push("נספח א'");
  for (const key of Object.keys(FIELD_LABELS) as (keyof ContractFields)[]) {
    lines.push(`${FIELD_LABELS[key]}: ${fields[key]}`);
  }
  lines.push(`עמלה: ${t.commissionPercent}%`);
  return lines.join("\n");
}

export const FIELD_KEYS = Object.keys(FIELD_LABELS) as (keyof ContractFields)[];

export function readFields(source: (key: string) => string): ContractFields {
  const out = {} as ContractFields;
  for (const key of FIELD_KEYS) out[key] = source(key).trim().slice(0, 400);
  return out;
}

export function parseFields(value: unknown): ContractFields | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return readFields((key) => String(v[key] ?? ""));
}
