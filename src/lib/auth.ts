import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { noStore } from "@/lib/security";

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

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export async function getQrViewSession() {
  const cookieStore = await cookies();
  return getIronSession<QrViewData>(cookieStore, getQrViewOptions());
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.adminId) {
    return null;
  }
  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, username: true },
  });
  if (!admin) {
    session.destroy();
    return null;
  }
  return { ...session, username: admin.username, adminId: admin.id };
}

export function unauthorized(message = "ADMIN AUTHENTICATION REQUIRED") {
  return NextResponse.json({ error: message }, noStore({ status: 401 }));
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, noStore({ status }));
}
