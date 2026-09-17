import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { clientIp, noStore, rateLimit, rateLimitResponse } from "@/lib/security";

const DUMMY_HASH = "$2b$10$qfzjihZRdEbrBZzX80VQSO/lvaQEe35KyhKdfBVG5LFQFJN.1OBsi";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter ?? 60);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, noStore({ status: 400 }));
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username and password are required." }, noStore({ status: 400 }));
  }

  const username = parsed.data.username.trim();
  const admin = await prisma.admin.findUnique({ where: { username } });
  const valid = await bcrypt.compare(parsed.data.password, admin?.passwordHash || DUMMY_HASH);

  if (!admin || !valid) {
    return NextResponse.json({ error: "ACCESS DENIED — Invalid credentials." }, noStore({ status: 401 }));
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

  return NextResponse.json({ ok: true, username: admin.username }, noStore());
}
