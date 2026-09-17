import Link from "next/link";
import { TerminalShell } from "@/components/TerminalShell";

export default function HomePage() {
  return (
    <TerminalShell title="International Student Registration System" footer={<LandingFooter />}>
      <section className="bezel mx-auto max-w-2xl px-6 py-10 sm:px-10 sm:py-14">
        <p className="clay-chip text-[var(--phosphor-bright)]">Student registration portal</p>
        <h2 className="mt-5 text-3xl font-extrabold leading-tight text-[var(--text)] sm:text-4xl">
          Register once. Show your clay-stamped QR to the coordinator.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
          Submit your details to receive a unique verification credential. After registration, a QR code is issued.
          Present that code to the coordinator. Do not share the code except with authorized staff.
        </p>
        <div className="mt-8">
          <Link href="/register" className="btn btn-amber btn-large">
            Start Registration
          </Link>
        </div>
        <div className="mt-8 text-sm font-bold text-[var(--muted)]">
          Authorized personnel only —{" "}
          <Link href="/admin/login">Admin access</Link>
        </div>
      </section>
    </TerminalShell>
  );
}

function LandingFooter() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span>Public student desk</span>
      <span>One-tap registration</span>
    </div>
  );
}
