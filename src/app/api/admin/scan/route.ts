import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseQrToken, scanSchema } from "@/lib/validations";
import { clientIp, noStore, rateLimit, rateLimitResponse } from "@/lib/security";
import { Prisma } from "@prisma/client";
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

  if (registration.workingStudent) {
    await prisma.auditLog.create({
      data: {
        action: "SCAN",
        adminId: session.adminId,
        registrationId: registration.id,
        details: `Lookup ${registration.displayId} (already in working database)`,
      },
    });

    return NextResponse.json(
      {
        alreadyAdded: true,
        added: false,
        message: "ALREADY VERIFIED — This student is already present in the working database.",
        registration: {
          id: registration.id,
          displayId: registration.displayId,
          name: registration.name,
          registrationNumber: registration.registrationNumber,
          category: registration.category,
          countryOfResidence: registration.countryOfResidence,
          phoneNumber: registration.phoneNumber,
          status: "ADDED_TO_WORKING_DB",
          createdAt: registration.createdAt,
          isDemo: registration.isDemo,
        },
      },
      noStore(),
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.workingStudent.create({
        data: {
          registrationId: registration.id,
          name: registration.name,
          registrationNumber: registration.registrationNumber,
          category: registration.category,
          countryOfResidence: registration.countryOfResidence,
          phoneNumber: registration.phoneNumber,
          addedByAdminId: session.adminId!,
        },
      });

      await tx.registration.update({
        where: { id: registration.id },
        data: { status: "ADDED_TO_WORKING_DB" },
      });

      await tx.auditLog.create({
        data: {
          action: "ADD_TO_WORKING_DB",
          adminId: session.adminId!,
          registrationId: registration.id,
          details: `Auto-added ${registration.displayId} on scan`,
        },
      });
    });

    return NextResponse.json(
      {
        alreadyAdded: false,
        added: true,
        message: "Student successfully added to working database.",
        registration: {
          id: registration.id,
          displayId: registration.displayId,
          name: registration.name,
          registrationNumber: registration.registrationNumber,
          category: registration.category,
          countryOfResidence: registration.countryOfResidence,
          phoneNumber: registration.phoneNumber,
          status: "ADDED_TO_WORKING_DB",
          createdAt: registration.createdAt,
          isDemo: registration.isDemo,
        },
      },
      noStore(),
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          alreadyAdded: true,
          added: false,
          message: "ALREADY VERIFIED — This student is already present in the working database.",
          registration: {
            id: registration.id,
            displayId: registration.displayId,
            name: registration.name,
            registrationNumber: registration.registrationNumber,
            category: registration.category,
            countryOfResidence: registration.countryOfResidence,
            phoneNumber: registration.phoneNumber,
            status: "ADDED_TO_WORKING_DB",
            createdAt: registration.createdAt,
            isDemo: registration.isDemo,
          },
        },
        noStore({ status: 200 }),
      );
    }
    console.error("scan_auto_add_failed");
    return jsonError("CONNECTION ERROR — Please try again.", 500);
  }
}
