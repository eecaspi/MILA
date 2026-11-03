const tones = {
  success: "border-sage/30 bg-sage-soft text-sage",
  info: "border-accent/30 bg-accent-soft text-accent",
  error: "border-danger/40 bg-danger-soft text-danger",
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
