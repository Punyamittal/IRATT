import { statusLabel } from "@/lib/format";

const TONE: Record<string, string> = {
  REGISTERED: "text-[var(--cyan)]",
  SCANNED: "text-[var(--amber)]",
  VERIFIED: "text-[var(--phosphor-bright)]",
  ADDED_TO_WORKING_DB: "text-[var(--phosphor-bright)]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`clay-chip ${TONE[status] ?? "text-[var(--text)]"}`}>
      {statusLabel(status)}
    </span>
  );
}
