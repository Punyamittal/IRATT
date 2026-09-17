import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { COUNTRIES } from "@/lib/countries";
import { generateDisplayId } from "@/lib/format";
import { normalizePhone, registrationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (!COUNTRIES.includes(data.countryOfResidence as (typeof COUNTRIES)[number])) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields.",
        fieldErrors: { countryOfResidence: "Select a valid country from the list." },
      },
      { status: 400 },
    );
  }

  const registrationNumber = data.registrationNumber.trim().toUpperCase();
  const existing = await prisma.registration.findUnique({
    where: { registrationNumber },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "A registration with this registration number already exists.",
        fieldErrors: { registrationNumber: "A registration with this registration number already exists." },
      },
      { status: 409 },
    );
  }

  const token = randomUUID();
  const displayId = generateDisplayId(token);
  const phoneNumber = normalizePhone(data.phoneNumber);

  try {
    const registration = await prisma.registration.create({
      data: {
        displayId,
        registrationToken: token,
        name: data.name.trim(),
        registrationNumber,
        category: data.category,
        countryOfResidence: data.countryOfResidence,
        phoneNumber,
        status: "REGISTERED",
      },
      select: {
        displayId: true,
        registrationToken: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      displayId: registration.displayId,
      token: registration.registrationToken,
      name: registration.name,
      createdAt: registration.createdAt,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A registration with this registration number already exists.",
          fieldErrors: { registrationNumber: "A registration with this registration number already exists." },
        },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "CONNECTION ERROR — Please try again." }, { status: 500 });
  }
}
