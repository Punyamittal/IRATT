import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (session.adminId) {
    await prisma.auditLog.create({
      data: {
        action: "LOGOUT",
        adminId: session.adminId,
        details: "Administrator session ended",
      },
    });
  }
  session.destroy();
  return NextResponse.json({ ok: true });
}
