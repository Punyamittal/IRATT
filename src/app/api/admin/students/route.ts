import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Category, Prisma, RegistrationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const CATEGORY_VALUES = new Set<string>(["OCI", "NRI", "FOREIGN_STUDENT"]);
const STATUS_VALUES = new Set<string>(["REGISTERED", "SCANNED", "VERIFIED", "ADDED_TO_WORKING_DB"]);

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session?.adminId) return unauthorized();

  const { searchParams } = request.nextUrl;
  const scope = searchParams.get("scope") === "all" ? "all" : "working";
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || 10) || 10));
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  if (category && !CATEGORY_VALUES.has(category)) {
    return jsonError("Invalid category filter.");
  }
  if (status && !STATUS_VALUES.has(status)) {
    return jsonError("Invalid status filter.");
  }

  try {
    if (scope === "working") {
      const where: Prisma.WorkingStudentWhereInput = {};
      if (q) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { registrationNumber: { contains: q, mode: "insensitive" } },
          { registration: { displayId: { contains: q, mode: "insensitive" } } },
        ];
      }
      if (category) where.category = category as Category;
      if (country) where.countryOfResidence = { contains: country, mode: "insensitive" };
      if (status && status !== "ADDED_TO_WORKING_DB") {
        return NextResponse.json({ items: [], total: 0, page, pageSize, pageCount: 0 });
      }

      const [total, items] = await Promise.all([
        prisma.workingStudent.count({ where }),
        prisma.workingStudent.findMany({
          where,
          include: {
            addedByAdmin: { select: { username: true } },
            registration: { select: { displayId: true, status: true, createdAt: true, isDemo: true } },
          },
          orderBy: { addedAt: sort },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return NextResponse.json({
        items: items.map((row) => ({
          id: row.id,
          registrationId: row.registrationId,
          displayId: row.registration.displayId,
          name: row.name,
          registrationNumber: row.registrationNumber,
          category: row.category,
          countryOfResidence: row.countryOfResidence,
          phoneNumber: row.phoneNumber,
          status: row.registration.status,
          addedAt: row.addedAt,
          addedBy: row.addedByAdmin.username,
          createdAt: row.registration.createdAt,
          isDemo: row.registration.isDemo,
        })),
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
      });
    }

    const where: Prisma.RegistrationWhereInput = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { registrationNumber: { contains: q, mode: "insensitive" } },
        { displayId: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category as Category;
    if (country) where.countryOfResidence = { contains: country, mode: "insensitive" };
    if (status) where.status = status as RegistrationStatus;

    const [total, items] = await Promise.all([
      prisma.registration.count({ where }),
      prisma.registration.findMany({
        where,
        include: {
          workingStudent: {
            include: { addedByAdmin: { select: { username: true } } },
          },
        },
        orderBy: { createdAt: sort },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      items: items.map((row) => ({
        id: row.workingStudent?.id ?? row.id,
        registrationId: row.id,
        displayId: row.displayId,
        name: row.name,
        registrationNumber: row.registrationNumber,
        category: row.category,
        countryOfResidence: row.countryOfResidence,
        phoneNumber: row.phoneNumber,
        status: row.status,
        addedAt: row.workingStudent?.addedAt ?? null,
        addedBy: row.workingStudent?.addedByAdmin.username ?? null,
        createdAt: row.createdAt,
        isDemo: row.isDemo,
      })),
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error(error);
    return jsonError("CONNECTION ERROR — Please try again.", 500);
  }
}
