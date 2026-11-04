import type { Metadata } from "next";
import Link from "next/link";
import { ClubPreview } from "@/components/home/ClubPreview";

export const metadata: Metadata = {
  title: "מועדון הלקוחות",
  description: "מועדון הלקוחות של לייקי בעבודה. בינתיים, כל ההטבות פתוחות לכולן.",
};

export default function ClubPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <ClubPreview />
      <p className="text-center text-ink-soft">
        בינתיים, כל ההטבות פתוחות לכולן.{" "}
        <Link href="/deals" className="font-semibold text-accent hover:underline">
          לייקי מצאה לך ←
        </Link>
      </p>
    </div>
  );
}
