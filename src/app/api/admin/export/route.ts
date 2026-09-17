import { jsonError, requireAdminSession, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categoryLabel, formatDateTime, statusLabel } from "@/lib/format";
import { sanitizeSpreadsheetCell } from "@/lib/security";
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

async function handleExport(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session?.adminId) return unauthorized();

  const format = (request.nextUrl.searchParams.get("format") || "csv").toLowerCase();

  const rows = await prisma.workingStudent.findMany({
    include: {
      addedByAdmin: { select: { username: true } },
      registration: { select: { status: true, displayId: true } },
    },
    orderBy: { addedAt: "desc" },
  });

  await prisma.auditLog.create({
    data: {
      action: "EXPORT",
      adminId: session.adminId,
      details: `Exported working database as ${format.toUpperCase()} (${rows.length} rows)`,
    },
  });

  const records = rows.map((row) => ({
    name: row.name,
    registrationNumber: row.registrationNumber,
    category: categoryLabel(row.category),
    countryOfResidence: row.countryOfResidence,
    phoneNumber: row.phoneNumber,
    status: statusLabel(row.registration.status),
    addedAt: formatDateTime(row.addedAt),
    addedBy: row.addedByAdmin.username,
    displayId: row.registration.displayId,
  }));

  if (format === "xlsx" || format === "excel") {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ISRS Terminal";
    const sheet = workbook.addWorksheet("Working Database");
    sheet.columns = [
      { header: "Name", key: "name", width: 28 },
      { header: "Registration Number", key: "registrationNumber", width: 22 },
      { header: "Category", key: "category", width: 18 },
      { header: "Country of Residence", key: "countryOfResidence", width: 24 },
      { header: "Personal Phone Number", key: "phoneNumber", width: 22 },
      { header: "Verification Status", key: "status", width: 28 },
      { header: "Added At", key: "addedAt", width: 22 },
      { header: "Added By", key: "addedBy", width: 18 },
      { header: "Registration ID", key: "displayId", width: 16 },
    ];
    sheet.addRows(
      records.map((row) => {
        const guarded: Record<string, string> = {};
        for (const [key, value] of Object.entries(row)) {
          guarded[key] = /^[=+\-@|]/.test(value) ? `'${value}` : value;
        }
        return guarded;
      }),
    );
    sheet.getRow(1).font = { bold: true };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="isrs-working-database.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  }

  const header = [
    "Name",
    "Registration Number",
    "Category",
    "Country of Residence",
    "Personal Phone Number",
    "Verification Status",
    "Added At",
    "Added By",
    "Registration ID",
  ];

  const csv = [
    header.join(","),
    ...records.map((row) =>
      [
        row.name,
        row.registrationNumber,
        row.category,
        row.countryOfResidence,
        row.phoneNumber,
        row.status,
        row.addedAt,
        row.addedBy,
        row.displayId,
      ]
        .map(sanitizeSpreadsheetCell)
        .join(","),
    ),
  ].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="isrs-working-database.csv"',
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  return handleExport(request);
}

export async function GET() {
  return jsonError("Use POST to export.", 405);
}
