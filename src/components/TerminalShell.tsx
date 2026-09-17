import Link from "next/link";

type TerminalShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  status?: string;
  operator?: string;
  footer?: React.ReactNode;
};

export function TerminalShell({
  children,
  eyebrow = "Dept. of International Student Affairs",
  title,
  status = "System online",
  operator,
  footer,
}: TerminalShellProps) {
  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="bezel mb-6 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-extrabold tracking-[0.12em] uppercase text-[var(--muted)]">
          <span>{eyebrow}</span>
          <span className="clay-chip text-[var(--phosphor-bright)]">
            <span className="led mr-2 bg-[var(--phosphor)]" />
            {status}
          </span>
        </div>
        <h1 className="terminal-title mt-4 text-2xl sm:text-4xl">{title}</h1>
        {operator ? (
          <p className="mt-3 text-sm font-bold text-[var(--muted)]">Operator: {operator}</p>
        ) : null}
      </header>
      <main>{children}</main>
      <footer className="no-print mt-10 text-sm font-bold text-[var(--muted)]">
        {footer ?? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>ISRS Clay Registry · Secure session</span>
            <Link href="/">Home</Link>
          </div>
        )}
      </footer>
    </div>
  );
}
