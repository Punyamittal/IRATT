import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const username = parsed.data.username.trim();
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    return NextResponse.json({ error: "ACCESS DENIED — Invalid credentials." }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "ACCESS DENIED — Invalid credentials." }, { status: 401 });
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.adminId = admin.id;
  session.username = admin.username;
  await session.save();

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      action: "LOGIN",
      adminId: admin.id,
      details: "Administrator session established",
    },
  });

  return NextResponse.json({ ok: true, username: admin.username });
}
