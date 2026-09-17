import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseQrToken, scanSchema } from "@/lib/validations";
import { clientIp, noStore, rateLimit, rateLimitResponse } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session?.adminId) return unauthorized();

  const limited = rateLimit(`scan:${session.adminId}:${clientIp(request)}`, 40, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter ?? 60);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("INVALID REGISTRATION TOKEN.");
  }

  const token = parseQrToken(parsed.data.payload);
  if (!token) {
    return jsonError("INVALID REGISTRATION TOKEN.");
  }

  const registration = await prisma.registration.findUnique({
    where: { registrationToken: token },
    include: { workingStudent: true },
  });

  if (!registration) {
    return jsonError("INVALID QR CODE — Registration not found.", 404);
  }

  if (registration.status === "REGISTERED") {
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: "SCANNED" },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "SCAN",
      adminId: session.adminId,
      registrationId: registration.id,
      details: `Lookup ${registration.displayId}`,
    },
  });

  return NextResponse.json({
    alreadyAdded: Boolean(registration.workingStudent),
    registration: {
      id: registration.id,
      displayId: registration.displayId,
      name: registration.name,
      registrationNumber: registration.registrationNumber,
      category: registration.category,
      countryOfResidence: registration.countryOfResidence,
      phoneNumber: registration.phoneNumber,
      status: registration.workingStudent ? "ADDED_TO_WORKING_DB" : "SCANNED",
      createdAt: registration.createdAt,
      isDemo: registration.isDemo,
    },
  }, noStore());
}
