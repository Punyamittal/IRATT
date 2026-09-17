"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { LoadingBlock, SystemMessage } from "@/components/Feedback";
import { TerminalShell } from "@/components/TerminalShell";
import { apiFetch, ApiError, downloadExport } from "@/lib/api";
import { formatClock } from "@/lib/format";

type Stats = {
  totalRegistered: number;
  pendingVerification: number;
  verified: number;
  addedToWorkingDb: number;
  username?: string;
  recent: Array<{
    id: string;
    action: string;
    displayId: string;
    createdAt: string;
  }>;
};

function actionLabel(action: string) {
  if (action === "ADD_TO_WORKING_DB") return "ADDED";
  if (action === "SCAN") return "SCANNED";
  return action;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.message : "CONNECTION ERROR — Please try again."));
  }, []);

  async function logout() {
    await apiFetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <TerminalShell title="Command Center" operator={stats?.username} footer={<DashboardFooter onLogout={logout} />}>
      {error ? <SystemMessage tone="bad">{error}</SystemMessage> : null}
      {!error && !stats ? <LoadingBlock label="POLLING SYSTEM STATUS..." /> : null}
      {stats ? (
        <div className="space-y-6">
          <p className="text-sm font-extrabold tracking-[0.08em] uppercase text-[var(--phosphor-bright)]">
            System status: <span className="clay-chip ml-2">Online</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Registered" value={stats.totalRegistered} />
            <StatCard label="Pending Verification" value={stats.pendingVerification} tone="amber" />
            <StatCard label="Verified" value={stats.verified} />
            <StatCard label="Added to Working Database" value={stats.addedToWorkingDb} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/admin/scanner" className="btn btn-amber btn-large min-h-24">
              Scan QR
            </Link>
            <Link href="/admin/students" className="btn btn-large min-h-24">
              View Students
            </Link>
            <Link href="/admin/students?focus=search" className="btn btn-large min-h-24">
              Search
            </Link>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="btn btn-large min-h-24" onClick={() => void downloadExport("csv")}>
                Export CSV
              </button>
              <button type="button" className="btn btn-large min-h-24" onClick={() => void downloadExport("xlsx")}>
                Export Excel
              </button>
            </div>
          </div>
          <section className="bezel p-5 sm:p-6">
            <h2 className="text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--muted)]">Recent activity</h2>
            <div className="mt-3 space-y-2 text-sm">
              {stats.recent.length === 0 ? (
                <p className="text-[var(--muted)]">No operator activity recorded.</p>
              ) : (
                stats.recent.map((item) => (
                  <div key={item.id} className="flex flex-wrap gap-x-6 gap-y-1 border-b border-[var(--line)] py-3 last:border-b-0">
                    <span className="font-mono text-[var(--muted)]">{formatClock(item.createdAt)}</span>
                    <span className="font-mono font-bold text-[var(--phosphor-bright)]">{item.displayId}</span>
                    <span className="font-extrabold uppercase text-[var(--amber)]">{actionLabel(item.action)}</span>
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

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "amber" }) {
  return (
    <div className="bezel px-5 py-6">
      <p className="text-xs font-extrabold tracking-[0.12em] uppercase text-[var(--muted)]">{label}</p>
      <p className={`mt-3 font-mono text-4xl font-bold ${tone === "amber" ? "text-[var(--amber)]" : "text-[var(--phosphor-bright)]"}`}>
        {String(value).padStart(3, "0")}
      </p>
    </div>
  );
}

function DashboardFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span>Admin command desk</span>
      <button type="button" onClick={onLogout} className="text-[var(--amber)]">
        LOG OUT
      </button>
    </div>
  );
}
