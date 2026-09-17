"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LoadingBlock, SystemMessage } from "@/components/Feedback";
import { RetroButton } from "@/components/RetroButton";
import { StatusBadge } from "@/components/StatusBadge";
import { TerminalShell } from "@/components/TerminalShell";
import { apiFetch, ApiError } from "@/lib/api";
import { categoryLabel, formatDateTime } from "@/lib/format";

type Detail = {
  id: string;
  displayId: string;
  name: string;
  registrationNumber: string;
  category: string;
  countryOfResidence: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  isDemo: boolean;
  working: { id: string; addedAt: string; addedBy: string } | null;
  history: Array<{ action: string; details: string | null; createdAt: string; admin: string }>;
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<Detail>(`/api/admin/students/${params.id}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "CONNECTION ERROR — Please try again."));
  }, [params.id]);

  return (
    <TerminalShell title="Student Record" footer={<Link href="/admin/students">Return to index</Link>}>
      {error ? <SystemMessage tone="bad">{error}</SystemMessage> : null}
      {!error && !data ? <LoadingBlock /> : null}
      {data ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="bezel p-6">
            <p className="font-mono text-sm font-bold text-[var(--muted)]">{data.displayId}</p>
            {data.isDemo ? <p className="mt-2 text-xs font-extrabold uppercase text-[var(--amber)]">Demo record</p> : null}
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--text)]">{data.name}</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <Item label="Registration No." value={data.registrationNumber} />
              <Item label="Category" value={categoryLabel(data.category)} />
              <Item label="Country of Residence" value={data.countryOfResidence} />
              <Item label="Phone" value={data.phoneNumber} />
              <div className="grid grid-cols-[160px_1fr] gap-2 border-b border-[var(--line)] py-3">
                <dt className="text-xs font-extrabold tracking-[0.1em] uppercase text-[var(--muted)]">Status</dt>
                <dd><StatusBadge status={data.status} /></dd>
              </div>
              <Item label="Registered At" value={formatDateTime(data.createdAt)} />
              {data.working ? (
                <>
                  <Item label="Added At" value={formatDateTime(data.working.addedAt)} />
                  <Item label="Added By" value={data.working.addedBy} />
                </>
              ) : null}
            </dl>
            <div className="mt-5">
              <RetroButton href="/admin/scanner">Scan Another</RetroButton>
            </div>
          </section>
          <section className="bezel p-6">
            <h3 className="text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--muted)]">Audit trace</h3>
            <div className="mt-4 space-y-2 text-sm">
              {data.history.length === 0 ? (
                <p className="text-[var(--muted)]">No audit events for this record.</p>
              ) : (
                data.history.map((item, index) => (
                  <div key={`${item.createdAt}-${index}`} className="border-b border-[var(--line)] py-3">
                    <p className="font-extrabold text-[var(--phosphor-bright)]">{item.action}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatDateTime(item.createdAt)} · {item.admin}
                    </p>
                    {item.details ? <p className="mt-1 text-sm">{item.details}</p> : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}
    </TerminalShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 border-b border-[var(--line)] py-3">
      <dt className="text-xs font-extrabold tracking-[0.1em] text-[var(--muted)]">{label.toUpperCase()}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
