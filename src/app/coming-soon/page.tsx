import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ליקי | האתר בבנייה",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <Image src="/brand/liky-logo.png" alt="ליקי" width={160} height={128} className="h-20 w-auto" />
      <h1 className="mt-6 text-3xl text-ink">האתר כרגע בבנייה</h1>
      <p className="mt-3 text-ink-soft">וברגע ההשקה הוא נפתח. נשמח לראות אתכן כאן בקרוב.</p>
      <Link href="/login" className="mt-10 text-sm text-ink-soft underline">
        כניסת צוות
      </Link>
    </main>
  );
}
