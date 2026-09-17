"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Field, RetroInput, RetroSelect } from "@/components/FormFields";
import { RetroButton } from "@/components/RetroButton";
import { EmptyState, LoadingBlock, SystemMessage } from "@/components/Feedback";
import { StatusBadge } from "@/components/StatusBadge";
import { TerminalShell } from "@/components/TerminalShell";
import { apiFetch, ApiError, downloadExport } from "@/lib/api";
import { categoryLabel, formatDateTime } from "@/lib/format";

type StudentRow = {
  id: string;
  registrationId: string;
  displayId: string;
  name: string;
  registrationNumber: string;
  category: string;
  countryOfResidence: string;
  phoneNumber: string;
  status: string;
  addedAt: string | null;
  addedBy: string | null;
  createdAt: string;
  isDemo: boolean;
};

type ListResponse = {
  items: StudentRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function StudentsInner() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [scope, setScope] = useState(searchParams.get("scope") === "all" ? "all" : "working");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [sort, setSort] = useState(searchParams.get("sort") === "asc" ? "asc" : "desc");
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("scope", scope);
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (country) params.set("country", country);
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("sort", sort);
    return params.toString();
  }, [scope, q, category, country, status, page, sort]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLoading(true);
      apiFetch<ListResponse>(`/api/admin/students?${query}`)
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((err) => setError(err instanceof ApiError ? err.message : "CONNECTION ERROR — Please try again."))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      document.getElementById("q")?.focus();
    }
  }, [searchParams]);

  return (
    <TerminalShell title="Student Records" footer={<StudentsFooter />}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`btn ${scope === "working" ? "btn-amber" : ""}`} onClick={() => { setScope("working"); setPage(1); }}>
          Working Database
        </button>
        <button className={`btn ${scope === "all" ? "btn-amber" : ""}`} onClick={() => { setScope("all"); setPage(1); }}>
          All Registrations
        </button>
        <button type="button" className="btn ml-auto" onClick={() => void downloadExport("csv")}>
          Export CSV
        </button>
        <button type="button" className="btn" onClick={() => void downloadExport("xlsx")}>
          Export Excel
        </button>
      </div>

      <form
        className="bezel mb-5 grid gap-4 p-5 md:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
        }}
      >
        <Field label="Search name / reg no." name="q">
          <RetroInput id="q" value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} />
        </Field>
        <Field label="Category" name="category">
          <RetroSelect value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="OCI">OCI</option>
            <option value="NRI">NRI</option>
            <option value="FOREIGN_STUDENT">Foreign Student</option>
          </RetroSelect>
        </Field>
        <Field label="Country" name="country">
          <RetroInput value={country} onChange={(event) => { setCountry(event.target.value); setPage(1); }} />
        </Field>
        <Field label="Status" name="status">
          <RetroSelect value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="REGISTERED">Registered</option>
            <option value="SCANNED">Scanned</option>
            <option value="VERIFIED">Verified</option>
            <option value="ADDED_TO_WORKING_DB">Added to Working Database</option>
          </RetroSelect>
        </Field>
        <Field label="Sort" name="sort">
          <RetroSelect value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </RetroSelect>
        </Field>
      </form>

      {error ? <SystemMessage tone="bad">{error}</SystemMessage> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && data && data.items.length === 0 ? (
        <EmptyState>No matching records in this index.</EmptyState>
      ) : null}
      {!loading && data && data.items.length > 0 ? (
        <div className="bezel overflow-x-auto p-3">
          <table className="table-grid">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg. No.</th>
                <th>Category</th>
                <th>Country</th>
                <th>Phone</th>
                <th>Status</th>
                <th>{scope === "working" ? "Added At" : "Registered"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.name}
                    {row.isDemo ? <span className="clay-chip ml-2 text-[var(--amber)]">Demo</span> : null}
                  </td>
                  <td>{row.registrationNumber}</td>
                  <td>{categoryLabel(row.category)}</td>
                  <td>{row.countryOfResidence}</td>
                  <td>{row.phoneNumber}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{formatDateTime(row.addedAt ?? row.createdAt)}</td>
                  <td>
                    <Link href={`/admin/students/${row.registrationId}`} className="text-[var(--amber)]">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data && data.pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">
            PAGE {data.page} / {data.pageCount} · {data.total} records
          </span>
          <div className="flex gap-2">
            <RetroButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </RetroButton>
            <RetroButton disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)}>
              Next
            </RetroButton>
          </div>
        </div>
      ) : null}
    </TerminalShell>
  );
}

function StudentsFooter() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span>Admin index</span>
      <Link href="/admin/dashboard">Return to command</Link>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <StudentsInner />
    </Suspense>
  );
}
