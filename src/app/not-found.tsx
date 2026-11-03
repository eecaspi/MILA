import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold text-ink">העמוד לא נמצא</h1>
      <p className="mt-3 text-ink-soft">ייתכן שהקישור שגוי או שהעמוד הוסר.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-on-accent"
      >
        חזרה לדף הבית
      </Link>
    </main>
  );
}
