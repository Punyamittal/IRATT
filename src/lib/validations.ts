import { z } from "zod";

export const CATEGORIES = ["OCI", "NRI", "FOREIGN_STUDENT"] as const;
export type CategoryValue = (typeof CATEGORIES)[number];

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or fewer.")
    .regex(/^[\p{L}\s.'-]+$/u, "Name may contain letters, spaces, apostrophes, periods, and hyphens only."),
  registrationNumber: z
    .string()
    .trim()
    .min(3, "Registration number must be at least 3 characters.")
    .max(32, "Registration number must be 32 characters or fewer.")
    .regex(/^[A-Za-z0-9][A-Za-z0-9\-\/]*$/, "Registration number may contain letters, numbers, hyphens, and slashes."),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Select a valid category." }),
  }),
  countryOfResidence: z
    .string()
    .trim()
    .min(2, "Country of residence is required.")
    .max(80, "Country name is too long."),
  phoneNumber: z
    .string()
    .trim()
    .min(8, "Enter a valid personal phone number.")
    .max(20, "Phone number is too long.")
    .regex(/^\+?[0-9][0-9\s\-()]{7,19}$/, "Enter a valid international phone number."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required.").max(64),
  password: z.string().min(1, "Password is required.").max(128),
});

export const scanSchema = z.object({
  payload: z.string().trim().min(1, "QR data is required.").max(200),
});

export const verifySchema = z.object({
  registrationId: z.string().trim().min(1, "Registration ID is required."),
});

export function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function parseQrToken(raw: string) {
  const trimmed = raw.trim();
  const prefixed = trimmed.match(/^REGISTRATION_TOKEN\s*=\s*(.+)$/i);
  if (prefixed) {
    return prefixed[1].trim();
  }
  return trimmed;
}
