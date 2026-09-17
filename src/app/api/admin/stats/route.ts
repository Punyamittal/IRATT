import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireAdminSession();
  if (!session?.adminId) return unauthorized();

  try {
    const [totalRegistered, pendingVerification, verified, addedToWorkingDb, recent] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({
        where: { status: { in: ["REGISTERED", "SCANNED"] } },
      }),
      prisma.registration.count({
        where: { status: { in: ["VERIFIED", "ADDED_TO_WORKING_DB"] } },
      }),
      prisma.workingStudent.count(),
      prisma.auditLog.findMany({
        where: { action: { in: ["SCAN", "ADD_TO_WORKING_DB", "VERIFY"] } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          registration: { select: { displayId: true, registrationNumber: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalRegistered,
      pendingVerification,
      verified,
      addedToWorkingDb,
      username: session.username,
      recent: recent.map((item) => ({
        id: item.id,
        action: item.action,
        displayId: item.registration?.displayId ?? "SYSTEM",
        registrationNumber: item.registration?.registrationNumber ?? null,
        createdAt: item.createdAt,
        details: item.details,
      })),
    });
  } catch (error) {
    console.error(error);
    return jsonError("CONNECTION ERROR — Please try again.", 500);
  }
}
