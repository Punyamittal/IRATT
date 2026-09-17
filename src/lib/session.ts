import { type SessionOptions } from "iron-session";

export type SessionData = {
  adminId?: string;
  username?: string;
  isLoggedIn: boolean;
};

export type QrViewData = {
  displayId?: string;
  token?: string;
  createdAt?: number;
};

function sessionPassword() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a string of at least 32 characters.");
  }
  return secret;
}

const cookieBase = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function getSessionOptions(): SessionOptions {
  return {
    password: sessionPassword(),
    cookieName: "isrs_session",
    cookieOptions: {
      ...cookieBase,
      maxAge: 60 * 60 * 8,
    },
  };
}

export function getQrViewOptions(): SessionOptions {
  return {
    password: sessionPassword(),
    cookieName: "isrs_qr_view",
    cookieOptions: {
      ...cookieBase,
      maxAge: 60 * 30,
    },
  };
}
