"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Field, RetroInput } from "@/components/FormFields";
import { RetroButton } from "@/components/RetroButton";
import { LoadingBlock, SystemMessage } from "@/components/Feedback";
import { TerminalShell } from "@/components/TerminalShell";
import { apiFetch, ApiError } from "@/lib/api";

function isSafeAdminPath(path: string) {
  return path.startsWith("/admin") && !path.startsWith("//") && !path.includes("\\") && !path.includes("://");
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      router.push(isSafeAdminPath(from) ? from : "/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "CONNECTION ERROR — Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <TerminalShell title="Administrator Access" eyebrow="Restricted console">
      <div className="mx-auto max-w-md">
        {error ? (
          <div className="mb-4">
            <SystemMessage tone="bad">{error}</SystemMessage>
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="bezel space-y-5 p-6">
          <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--amber)]">
            Authorized operators only
          </p>
          <Field label="Username" name="username">
            <RetroInput
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </Field>
          <Field label="Password" name="password">
            <RetroInput
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <RetroButton type="submit" variant="amber" large disabled={busy}>
            {busy ? "Authenticating..." : "Log In"}
          </RetroButton>
        </form>
      </div>
    </TerminalShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading console..." />}>
      <LoginInner />
    </Suspense>
  );
}
