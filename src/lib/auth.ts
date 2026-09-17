import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { noStore } from "@/lib/security";
import { getQrViewOptions, getSessionOptions, type QrViewData, type SessionData } from "@/lib/session";

export type { QrViewData, SessionData };
export { getQrViewOptions, getSessionOptions };

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
