const tones = {
  success: "border-sage/30 bg-sage-soft text-sage",
  info: "border-plum/20 bg-plum-soft text-plum",
  error: "border-red-300 bg-red-50 text-red-800",
} as const;

export function Alert({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
