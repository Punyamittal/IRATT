"use client";

import { useCallback, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Field, RetroInput } from "@/components/FormFields";
import { RetroButton } from "@/components/RetroButton";
import { LoadingBlock, SystemMessage } from "@/components/Feedback";
import { TerminalShell } from "@/components/TerminalShell";
import { apiFetch, ApiError } from "@/lib/api";
import { categoryLabel } from "@/lib/format";

type ScanResult = {
  alreadyAdded: boolean;
  registration: {
    id: string;
    displayId: string;
    name: string;
    registrationNumber: string;
    category: string;
    countryOfResidence: string;
    phoneNumber: string;
    status: string;
    isDemo: boolean;
  };
};

export default function ScannerPage() {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "warn" | "bad"; text: string } | null>(null);
  const [found, setFound] = useState<ScanResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [paused, setPaused] = useState(false);
  const lock = useRef(false);

  const lookup = useCallback(async (payload: string) => {
    if (!payload.trim() || lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage(null);
    setPaused(true);
    try {
      const result = await apiFetch<ScanResult>("/api/admin/scan", {
        method: "POST",
        body: JSON.stringify({ payload }),
      });
      setFound(result);
      if (result.alreadyAdded) {
        setMessage({
          tone: "warn",
          text: "ALREADY VERIFIED — This student is already present in the working database.",
        });
      }
    } catch (error) {
      setFound(null);
      setMessage({
        tone: "bad",
        text: error instanceof ApiError ? error.message : "CONNECTION ERROR — Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }, []);

  async function addToWorking() {
    if (!found) return;
    setAdding(true);
    try {
      const result = await apiFetch<{ message: string }>("/api/admin/verify", {
        method: "POST",
        body: JSON.stringify({ registrationId: found.registration.id }),
      });
      setMessage({ tone: "ok", text: result.message });
      setFound({
        ...found,
        alreadyAdded: true,
        registration: { ...found.registration, status: "ADDED_TO_WORKING_DB" },
      });
      setConfirmOpen(false);
    } catch (error) {
      setMessage({
        tone: "warn",
        text: error instanceof ApiError ? error.message : "CONNECTION ERROR — Please try again.",
      });
      setConfirmOpen(false);
    } finally {
      setAdding(false);
    }
  }

  function reset() {
    lock.current = false;
    setFound(null);
    setMessage(null);
    setManual("");
    setPaused(false);
  }

  return (
    <TerminalShell title="QR Verification Scanner" footer={<ScannerFooter />}>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bezel p-5 sm:p-6">
          <p className="mb-4 text-xs font-extrabold tracking-[0.12em] uppercase text-[var(--muted)]">
            Camera input · desktop / mobile / laptop
          </p>
          <div className="overflow-hidden rounded-[24px] bg-[#2d261f]">
            <Scanner
              onScan={(codes) => {
                const value = codes[0]?.rawValue;
                if (value) void lookup(value);
              }}
              onError={(error) => {
                const text = error?.message || "Camera unavailable. Use manual entry or allow camera permission.";
                setCameraError(text);
              }}
              constraints={{ facingMode: "environment" }}
              formats={["qr_code"]}
              paused={paused}
              styles={{ container: { width: "100%" } }}
            />
          </div>
          {cameraError ? <p className="mt-3 text-sm font-bold text-[var(--amber)]">{cameraError}</p> : null}
          {busy ? (
            <div className="mt-3">
              <LoadingBlock label="Looking up token..." />
            </div>
          ) : null}
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void lookup(manual);
            }}
          >
            <Field label="Manual QR data / token" name="manual">
              <RetroInput
                id="manual"
                name="manual"
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="REGISTRATION_TOKEN=..."
              />
            </Field>
            <RetroButton type="submit" disabled={busy}>
              Lookup Token
            </RetroButton>
          </form>
        </section>

        <section className="space-y-4">
          {message ? <SystemMessage tone={message.tone}>{message.text}</SystemMessage> : null}
          {found ? (
            <div className="bezel p-6">
              <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--phosphor-bright)]">
                Registration found
              </p>
              {found.registration.isDemo ? (
                <p className="mt-2 text-xs font-extrabold uppercase text-[var(--amber)]">Demo record</p>
              ) : null}
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="NAME" value={found.registration.name} />
                <Row label="REG NO" value={found.registration.registrationNumber} />
                <Row label="REG ID" value={found.registration.displayId} />
                <Row label="CATEGORY" value={categoryLabel(found.registration.category)} />
                <Row label="COUNTRY OF RESIDENCE" value={found.registration.countryOfResidence} />
                <Row label="PHONE" value={found.registration.phoneNumber} />
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <RetroButton
                  variant="amber"
                  large
                  disabled={found.alreadyAdded}
                  onClick={() => setConfirmOpen(true)}
                >
                  Add to Working Database
                </RetroButton>
                <RetroButton onClick={reset}>Cancel / Scan Next</RetroButton>
              </div>
            </div>
          ) : (
            <div className="bezel p-6 text-base leading-7 text-[var(--muted)]">
              Align the student QR code within the frame. The token is validated on the server. Personal data is never
              trusted from the QR payload itself.
            </div>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Commit to working database?"
        body="This copies the verified registration into the working student table and cannot create a duplicate."
        confirmLabel="ADD RECORD"
        onConfirm={addToWorking}
        onCancel={() => setConfirmOpen(false)}
        busy={adding}
      />
    </TerminalShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-[var(--line)] py-2">
      <dt className="text-xs font-extrabold tracking-[0.1em] text-[var(--muted)]">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

function ScannerFooter() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span>Admin scanner</span>
      <a href="/admin/dashboard">Return to command</a>
    </div>
  );
}
