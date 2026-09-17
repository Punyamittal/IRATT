import Link from "next/link";
import { TerminalShell } from "@/components/TerminalShell";

export default function NotFound() {
  return (
    <TerminalShell title="Record Not Found">
      <div className="bezel mx-auto max-w-lg p-8 text-center">
        <p className="font-extrabold text-[var(--alert)]">Error 404 — path not in directory</p>
        <p className="mt-4 text-base text-[var(--muted)]">The requested page does not exist.</p>
        <Link href="/" className="btn mt-6 inline-flex">
          Return Home
        </Link>
      </div>
    </TerminalShell>
  );
}
