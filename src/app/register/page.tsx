"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CountrySelect } from "@/components/CountrySelect";
import { Field, RetroInput, RetroSelect } from "@/components/FormFields";
import { RetroButton } from "@/components/RetroButton";
import { SystemMessage } from "@/components/Feedback";
import { TerminalShell } from "@/components/TerminalShell";
import { apiFetch, ApiError, getFieldErrors } from "@/lib/api";

type FormState = {
  name: string;
  registrationNumber: string;
  category: string;
  countryOfResidence: string;
  phoneNumber: string;
};

const INITIAL: FormState = {
  name: "",
  registrationNumber: "",
  category: "",
  countryOfResidence: "",
  phoneNumber: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBanner(null);
    setBusy(true);
    try {
      await apiFetch<{ displayId: string }>("/api/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/register/success");
    } catch (error) {
      setErrors(getFieldErrors(error));
      setBanner(error instanceof ApiError ? error.message : "CONNECTION ERROR — Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <TerminalShell title="Student Registration Form">
      <div className="mx-auto max-w-2xl">
        {banner ? (
          <div className="mb-4">
            <SystemMessage tone="bad">{banner}</SystemMessage>
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="bezel space-y-5 p-6 sm:p-8">
          <p className="mb-4 text-sm font-extrabold tracking-[0.08em] uppercase text-[var(--muted)]">
            All fields required
          </p>
          <Field label="Name" name="name" error={errors.name}>
            <RetroInput
              id="name"
              name="name"
              value={form.name}
              error={Boolean(errors.name)}
              onChange={(event) => update("name", event.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Registration Number" name="registrationNumber" error={errors.registrationNumber}>
            <RetroInput
              id="registrationNumber"
              name="registrationNumber"
              value={form.registrationNumber}
              error={Boolean(errors.registrationNumber)}
              onChange={(event) => update("registrationNumber", event.target.value)}
            />
          </Field>
          <Field label="Category" name="category" error={errors.category}>
            <RetroSelect
              id="category"
              name="category"
              value={form.category}
              error={Boolean(errors.category)}
              onChange={(event) => update("category", event.target.value)}
            >
              <option value="">Select category</option>
              <option value="OCI">OCI</option>
              <option value="NRI">NRI</option>
              <option value="FOREIGN_STUDENT">Foreign Student</option>
            </RetroSelect>
          </Field>
          <Field
            label="Country of Residence (Outside India)"
            name="countryOfResidence"
            error={errors.countryOfResidence}
            hint="Required for OCI, NRI, and Foreign Student. If you currently study in India, enter your country of residence outside India."
          >
            <CountrySelect
              name="countryOfResidence"
              value={form.countryOfResidence}
              onChange={(value) => update("countryOfResidence", value)}
              error={Boolean(errors.countryOfResidence)}
            />
          </Field>
          <Field
            label="Personal Phone Number"
            name="phoneNumber"
            error={errors.phoneNumber}
            hint="Include country code, e.g. +14155552671"
          >
            <RetroInput
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              error={Boolean(errors.phoneNumber)}
              onChange={(event) => update("phoneNumber", event.target.value)}
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
          <RetroButton type="submit" variant="amber" large disabled={busy}>
            {busy ? "SUBMITTING..." : "Submit Registration"}
          </RetroButton>
        </form>
      </div>
    </TerminalShell>
  );
}
