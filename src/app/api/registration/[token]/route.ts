import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseQrToken } from "@/lib/validations";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token: raw } = await params;
  const token = parseQrToken(decodeURIComponent(raw));

  if (!token) {
    return NextResponse.json({ error: "INVALID REGISTRATION TOKEN." }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { registrationToken: token },
    select: {
      displayId: true,
      registrationToken: true,
      name: true,
      createdAt: true,
      status: true,
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "INVALID QR CODE — Registration not found." }, { status: 404 });
  }

  return NextResponse.json({
    displayId: registration.displayId,
    token: registration.registrationToken,
    name: registration.name,
    createdAt: registration.createdAt,
    status: registration.status,
  });
}
