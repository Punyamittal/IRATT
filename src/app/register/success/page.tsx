"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { QrPanel } from "@/components/QrPanel";
import { LoadingBlock, SystemMessage } from "@/components/Feedback";
import { TerminalShell } from "@/components/TerminalShell";
import { RetroButton } from "@/components/RetroButton";
import { apiFetch, ApiError } from "@/lib/api";

type RegistrationPublic = {
  displayId: string;
  token: string;
  name: string;
};

function SuccessInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [data, setData] = useState<RegistrationPublic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("INVALID REGISTRATION TOKEN.");
      return;
    }
    let cancelled = false;
    apiFetch<RegistrationPublic>(`/api/registration/${encodeURIComponent(token)}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "CONNECTION ERROR — Please try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <TerminalShell title="Registration Complete">
      {error ? <SystemMessage tone="bad">{error}</SystemMessage> : null}
      {!error && !data ? <LoadingBlock label="GENERATING CREDENTIAL..." /> : null}
      {data ? (
        <div className="mx-auto max-w-xl">
          <p className="mb-2 text-center text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--phosphor-bright)]">
            Registration complete
          </p>
          <p className="mb-6 text-center text-lg font-extrabold text-[var(--text)]">
            Registration ID: <span className="font-mono text-[var(--amber)]">{data.displayId}</span>
          </p>
          <QrPanel token={data.token} displayId={data.displayId} />
          <div className="no-print mt-6 text-center">
            <RetroButton href="/">Return home</RetroButton>
          </div>
        </div>
      ) : null}
    </TerminalShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingBlock label="LOADING..." />}>
      <SuccessInner />
    </Suspense>
  );
}
