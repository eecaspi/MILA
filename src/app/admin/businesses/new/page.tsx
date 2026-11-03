import Link from "next/link";
import { BusinessForm } from "@/components/admin/BusinessForm";

export default function NewBusiness() {
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/businesses" className="text-sm text-ink-soft hover:text-accent">
        → כל העסקים
      </Link>
      <h1 className="text-2xl text-ink">עסק חדש</h1>
      <p className="text-sm text-ink-soft">
        עסק חדש נשמר כטיוטה עד שמסמנים &quot;מפורסם באתר&quot;.
      </p>
      <BusinessForm />
    </div>
  );
}
