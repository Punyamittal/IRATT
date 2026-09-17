import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { noStore } from "@/lib/security";
import { verifySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session?.adminId) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.");
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("INVALID REGISTRATION TOKEN.");
  }

  const registration = await prisma.registration.findUnique({
    where: { id: parsed.data.registrationId },
    include: { workingStudent: true },
  });

  if (!registration) {
    return jsonError("INVALID QR CODE — Registration not found.", 404);
  }

  if (registration.workingStudent) {
    return jsonError("ALREADY VERIFIED — This student is already present in the working database.", 409, {
      code: "ALREADY_ADDED",
    });
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
          details: `Added ${registration.displayId} to working database`,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "Student successfully added to working database.",
    }, noStore());
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("This registration has already been added to the working database.", 409, {
        code: "ALREADY_ADDED",
      });
    }
    console.error("verify_failed");
    return jsonError("CONNECTION ERROR — Please try again.", 500);
  }
}
