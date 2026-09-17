import { QrPanel } from "@/components/QrPanel";
import { SystemMessage } from "@/components/Feedback";
import { TerminalShell } from "@/components/TerminalShell";
import { RetroButton } from "@/components/RetroButton";
import { getQrViewSession } from "@/lib/auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SuccessPage() {
  const view = await getQrViewSession();

  return (
    <TerminalShell title="Registration Complete">
      {!view.displayId || !view.token ? (
        <SystemMessage tone="bad">INVALID REGISTRATION TOKEN.</SystemMessage>
      ) : (
        <div className="mx-auto max-w-xl">
          <p className="mb-2 text-center text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--phosphor-bright)]">
            Registration complete
          </p>
          <p className="mb-6 text-center text-lg font-extrabold text-[var(--text)]">
            Registration ID: <span className="font-mono text-[var(--amber)]">{view.displayId}</span>
          </p>
          <QrPanel displayId={view.displayId} />
          <div className="no-print mt-6 text-center">
            <RetroButton href="/">Return home</RetroButton>
          </div>
        </div>
      )}
    </TerminalShell>
  );
}
