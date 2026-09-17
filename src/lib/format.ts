import { Category, RegistrationStatus } from "@prisma/client";

export const QR_PREFIX = "REGISTRATION_TOKEN=";

export function buildQrPayload(token: string) {
  return `${QR_PREFIX}${token}`;
}

export function categoryLabel(category: Category | string) {
  switch (category) {
    case "FOREIGN_STUDENT":
      return "Foreign Student";
    case "OCI":
      return "OCI";
    case "NRI":
      return "NRI";
    default:
      return category;
  }
}

export function statusLabel(status: RegistrationStatus | string) {
  switch (status) {
    case "REGISTERED":
      return "Registered";
    case "SCANNED":
      return "Scanned";
    case "VERIFIED":
      return "Verified";
    case "ADDED_TO_WORKING_DB":
      return "Added to Working Database";
    default:
      return status;
  }
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatClock(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return phone.slice(0, Math.max(0, phone.length - 4)).replace(/\d/g, "X") + phone.slice(-4);
}

export function generateDisplayId(tokenOrRandom: string) {
  const compact = tokenOrRandom.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REG-${compact}`;
}
