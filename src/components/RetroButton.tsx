import Link from "next/link";

type RetroButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  href?: string;
  variant?: "default" | "amber" | "alert";
  large?: boolean;
  disabled?: boolean;
  className?: string;
};

export function RetroButton({
  children,
  onClick,
  type = "button",
  href,
  variant = "default",
  large,
  disabled,
  className = "",
}: RetroButtonProps) {
  const classes = [
    "btn",
    variant === "amber" ? "btn-amber" : "",
    variant === "alert" ? "btn-alert" : "",
    large ? "btn-large" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
