import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function displayId() {
  return `REG-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

async function main() {
  const username = process.env.ADMIN_SEED_USERNAME || "admin";
  const password = process.env.ADMIN_SEED_PASSWORD || "terminal-admin-1984";
  const email = process.env.ADMIN_SEED_EMAIL || "admin@isrs.local";
  const seedDemo = process.env.SEED_DEMO_DATA !== "false";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { passwordHash, email },
    create: { username, email, passwordHash },
  });

  if (!seedDemo) {
    console.log("Demo student seed skipped (SEED_DEMO_DATA=false).");
    console.log(`Admin ready: ${admin.username}`);
    return;
  }

  const existingDemo = await prisma.registration.count({ where: { isDemo: true } });
  if (existingDemo > 0) {
    console.log("Demo registrations already present — skipping student seed.");
    console.log(`Admin ready: ${admin.username}`);
    return;
  }

  const demoStudents = [
    {
      name: "[DEMO] Anika Sharma",
      registrationNumber: "DEMO-OCI-1001",
      category: "OCI" as const,
      countryOfResidence: "United States",
      phoneNumber: "+12025550101",
      status: "REGISTERED" as const,
    },
    {
      name: "[DEMO] Kenji Watanabe",
      registrationNumber: "DEMO-FS-1002",
      category: "FOREIGN_STUDENT" as const,
      countryOfResidence: "Japan",
      phoneNumber: "+81312345678",
      status: "SCANNED" as const,
    },
    {
      name: "[DEMO] Priya Patel",
      registrationNumber: "DEMO-NRI-1003",
      category: "NRI" as const,
      countryOfResidence: "Canada",
      phoneNumber: "+14165550123",
      status: "ADDED_TO_WORKING_DB" as const,
    },
    {
      name: "[DEMO] Luca Rossi",
      registrationNumber: "DEMO-NRI-1004",
      category: "NRI" as const,
      countryOfResidence: "Italy",
      phoneNumber: "+390612345678",
      status: "REGISTERED" as const,
    },
  ];

  for (const student of demoStudents) {
    const registration = await prisma.registration.create({
      data: {
        displayId: displayId(),
        registrationToken: randomUUID(),
        ...student,
        isDemo: true,
      },
    });

    if (student.status === "ADDED_TO_WORKING_DB") {
      await prisma.workingStudent.create({
        data: {
          registrationId: registration.id,
          name: student.name,
          registrationNumber: student.registrationNumber,
          category: student.category,
          countryOfResidence: student.countryOfResidence,
          phoneNumber: student.phoneNumber,
          addedByAdminId: admin.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "ADD_TO_WORKING_DB",
          adminId: admin.id,
          registrationId: registration.id,
          details: "Seeded demo verification",
        },
      });
    }

    console.log(
      `DEMO ${registration.registrationNumber}  ${registration.displayId}  REGISTRATION_TOKEN=${registration.registrationToken}  ${student.status}`,
    );
  }

  console.log("Seed complete.");
  console.log(`Admin username: ${username}`);
  console.log("Remove demo records before production: set SEED_DEMO_DATA=false and delete isDemo=true rows.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
