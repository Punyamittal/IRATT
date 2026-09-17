import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireAdminSession();
  if (!session?.adminId) return unauthorized();

  const { id } = await params;

  const registration = await prisma.registration.findFirst({
    where: { OR: [{ id }, { displayId: id }] },
    include: {
      workingStudent: {
        include: { addedByAdmin: { select: { username: true } } },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { admin: { select: { username: true } } },
      },
    },
  });

  if (!registration) {
    return jsonError("INVALID QR CODE — Registration not found.", 404);
  }

  return NextResponse.json({
    id: registration.id,
    displayId: registration.displayId,
    name: registration.name,
    registrationNumber: registration.registrationNumber,
    category: registration.category,
    countryOfResidence: registration.countryOfResidence,
    phoneNumber: registration.phoneNumber,
    status: registration.status,
    createdAt: registration.createdAt,
    isDemo: registration.isDemo,
    working: registration.workingStudent
      ? {
          id: registration.workingStudent.id,
          addedAt: registration.workingStudent.addedAt,
          addedBy: registration.workingStudent.addedByAdmin.username,
        }
      : null,
    history: registration.auditLogs.map((log) => ({
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
      admin: log.admin.username,
    })),
  });
}
