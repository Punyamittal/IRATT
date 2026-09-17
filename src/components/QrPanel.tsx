"use client";

import { RetroButton } from "@/components/RetroButton";

type QrPanelProps = {
  displayId: string;
};

export function QrPanel({ displayId }: QrPanelProps) {
  async function download() {
    const response = await fetch("/api/registration/qr", { credentials: "same-origin" });
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${displayId}-qr.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="print-sheet bezel mx-auto max-w-md p-6 text-center sm:p-8">
      <p className="text-xs font-extrabold tracking-[0.16em] uppercase text-[var(--muted)]">
        Registration credential
      </p>
      <p className="mt-2 font-mono text-xl font-bold tracking-[0.12em] text-[var(--amber)]">{displayId}</p>
      <div
        className="mx-auto mt-6 inline-block rounded-[28px] bg-white p-4"
        style={{
          boxShadow:
            "inset 4px 5px 10px rgba(138,108,74,0.12), 8px 10px 18px rgba(138,108,74,0.18), -4px -5px 12px rgba(255,250,243,0.9)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/registration/qr"
          alt="Registration QR code"
          width={280}
          height={280}
          className="h-[280px] w-[280px]"
        />
      </div>
      <p className="mt-5 text-base leading-7 text-[var(--text)]">
        Please present this QR code
        <br />
        to the coordinator for verification.
      </p>
      <p className="mt-3 text-xs font-bold tracking-[0.08em] uppercase text-[var(--muted)]">
        Payload contains token only
      </p>
      <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
        <RetroButton className="flex-1" onClick={() => void download()}>
          Download QR
        </RetroButton>
        <RetroButton className="flex-1" variant="amber" onClick={() => window.print()}>
          Print QR
        </RetroButton>
      </div>
    </div>
  );
}
