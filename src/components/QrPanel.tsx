"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { RetroButton } from "@/components/RetroButton";
import { buildQrPayload } from "@/lib/format";

type QrPanelProps = {
  token: string;
  displayId: string;
};

export function QrPanel({ token, displayId }: QrPanelProps) {
  const canvasWrap = useRef<HTMLDivElement>(null);
  const payload = buildQrPayload(token);

  function download() {
    const canvas = canvasWrap.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${displayId}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="print-sheet bezel mx-auto max-w-md p-6 text-center sm:p-8">
      <p className="text-xs font-extrabold tracking-[0.16em] uppercase text-[var(--muted)]">
        Registration credential
      </p>
      <p className="mt-2 font-mono text-xl font-bold tracking-[0.12em] text-[var(--amber)]">{displayId}</p>
      <div
        ref={canvasWrap}
        className="mx-auto mt-6 inline-block rounded-[28px] bg-white p-4"
        style={{
          boxShadow:
            "inset 4px 5px 10px rgba(138,108,74,0.12), 8px 10px 18px rgba(138,108,74,0.18), -4px -5px 12px rgba(255,250,243,0.9)",
        }}
      >
        <QRCodeCanvas
          value={payload}
          size={280}
          level="H"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#3d3228"
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
        <RetroButton className="flex-1" onClick={download}>
          Download QR
        </RetroButton>
        <RetroButton className="flex-1" variant="amber" onClick={() => window.print()}>
          Print QR
        </RetroButton>
      </div>
    </div>
  );
}
