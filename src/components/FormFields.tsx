type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ label, name, error, hint, children }: FieldProps) {
  return (
    <label className="block" htmlFor={name}>
      <span className="mb-2 block text-xs font-extrabold tracking-[0.12em] text-[var(--muted)] uppercase">
        {label}
      </span>
      {children}
      {error ? <span className="mt-2 block text-sm font-bold text-[var(--alert)]">{error}</span> : null}
      {!error && hint ? <span className="mt-2 block text-sm text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

type RetroInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function RetroInput({ error, className = "", ...props }: RetroInputProps) {
  return <input className={`field ${error ? "field-error" : ""} ${className}`} {...props} />;
}

type RetroSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export function RetroSelect({ error, className = "", children, ...props }: RetroSelectProps) {
  return (
    <select className={`field ${error ? "field-error" : ""} ${className}`} {...props}>
      {children}
    </select>
  );
}
