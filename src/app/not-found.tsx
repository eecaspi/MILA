import Link from "next/link";
import { HeartMark } from "@/components/brand/HeartMark";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <HeartMark size={64} />
      <h1 className="mt-6 text-3xl text-ink">אופס, את העמוד הזה לא מצאתי</h1>
      <p className="mt-3 text-ink-soft">אולי הקישור השתנה. אבל יש לי משהו אחר בשבילך!</p>
      <Link href="/" className="btn-primary mt-8">
        חזרה לדף הבית
      </Link>
    </main>
  );
}
