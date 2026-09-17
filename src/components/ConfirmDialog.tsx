"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  busy,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d3228]/35 p-4 backdrop-blur-[2px]">
      <div className="bezel w-full max-w-md p-6 sm:p-7">
        <p className="text-xs font-extrabold tracking-[0.14em] uppercase text-[var(--amber)]">
          Confirmation required
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-[var(--text)]">{title}</h2>
        <p className="mt-3 text-base leading-7 text-[var(--text)]">{body}</p>
        <div className="mt-6 flex gap-3">
          <button className="btn btn-amber flex-1" onClick={onConfirm} disabled={busy} type="button">
            {busy ? "Processing..." : confirmLabel}
          </button>
          <button className="btn flex-1" onClick={onCancel} disabled={busy} type="button">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
