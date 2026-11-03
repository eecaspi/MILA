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
  unknown: "משהו השתבש. נסי שוב בעוד רגע.",
} as const;

export type AuthMessageCode = keyof typeof authMessages;

export function authMessage(code: unknown): string | null {
  return typeof code === "string" && code in authMessages
    ? authMessages[code as AuthMessageCode]
    : null;
}
