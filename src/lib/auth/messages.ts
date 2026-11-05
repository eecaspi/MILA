/** Hebrew messages for auth outcomes, keyed by the code passed in the URL. */
export const authMessages = {
  invalid_credentials: "האימייל או הסיסמה לא נכונים.",
  missing_fields: "צריך למלא אימייל וסיסמה.",
  weak_password: "הסיסמה צריכה להכיל לפחות 8 תווים.",
  email_taken: "כבר קיים חשבון עם האימייל הזה. אפשר להתחבר.",
  check_email: "שלחנו לך אימייל לאישור החשבון. אחרי האישור אפשר להתחבר.",
  confirm_failed: "הקישור לאישור החשבון לא תקין או שפג תוקפו. נסי להירשם או להתחבר שוב.",
  signed_out: "התנתקת בהצלחה.",
  not_configured: "ההרשמה למועדון תיפתח בקרוב.",
  channel_required: "צריך לבחור איך נשארות בקשר: קבוצת וואטסאפ או אימייל.",
  terms_required: "כדי להירשם צריך לאשר את תנאי השימוש ואת מדיניות הפרטיות.",
  marketing_required: "כדי להצטרף לרשימת העדכונים במייל צריך לאשר קבלת דיוור. אפשר גם לבחור בקבוצת הוואטסאפ.",
  signup_closed: "מועדון הלקוחות עדיין בעבודה, וההרשמה תיפתח בקרוב.",
  missing_fields_password: "צריך למלא את כל השדות.",
  wrong_current_password: "הסיסמה הנוכחית לא נכונה.",
  password_mismatch: "שתי הסיסמאות החדשות לא זהות.",
  same_password: "הסיסמה החדשה זהה לנוכחית. בחרי סיסמה אחרת.",
  unknown: "משהו השתבש. נסי שוב בעוד רגע.",
} as const;

export type AuthMessageCode = keyof typeof authMessages;

export function authMessage(code: unknown): string | null {
  return typeof code === "string" && code in authMessages
    ? authMessages[code as AuthMessageCode]
    : null;
}
