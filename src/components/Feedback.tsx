export function SystemMessage({
  tone = "ok",
  children,
}: {
  tone?: "ok" | "warn" | "bad";
  children: React.ReactNode;
}) {
  const cls = tone === "bad" ? "status-bad" : tone === "warn" ? "status-warn" : "status-ok";
  return (
    <div className={`bezel px-5 py-4 text-sm font-bold ${cls}`}>
      <span className="mr-2 text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--muted)]">Notice</span>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="bezel px-5 py-12 text-center text-base font-bold text-[var(--muted)]">{children}</div>;
}

export function LoadingBlock({ label = "Accessing records..." }: { label?: string }) {
  return (
    <div className="bezel px-5 py-10 text-center text-sm font-extrabold tracking-[0.12em] uppercase text-[var(--amber)]">
      {label}
      <span className="blink ml-1 inline-block h-2 w-2 rounded-full bg-[var(--amber)]" />
    </div>
  );
}
