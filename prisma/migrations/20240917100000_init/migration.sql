-- CreateEnum
CREATE TYPE "Category" AS ENUM ('OCI', 'NRI', 'FOREIGN_STUDENT');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'SCANNED', 'VERIFIED', 'ADDED_TO_WORKING_DB');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "display_id" TEXT NOT NULL,
    "registration_token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "country_of_residence" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_students" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "country_of_residence" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "added_by_admin" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "working_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "registration_id" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_display_id_key" ON "registrations"("display_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_registration_token_key" ON "registrations"("registration_token");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_registration_number_key" ON "registrations"("registration_number");

-- CreateIndex
CREATE INDEX "registrations_status_idx" ON "registrations"("status");

-- CreateIndex
CREATE INDEX "registrations_category_idx" ON "registrations"("category");

-- CreateIndex
CREATE INDEX "registrations_country_of_residence_idx" ON "registrations"("country_of_residence");

-- CreateIndex
CREATE INDEX "registrations_created_at_idx" ON "registrations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "working_students_registration_id_key" ON "working_students"("registration_id");

-- CreateIndex
CREATE INDEX "working_students_registration_number_idx" ON "working_students"("registration_number");

-- CreateIndex
CREATE INDEX "working_students_category_idx" ON "working_students"("category");

-- CreateIndex
CREATE INDEX "working_students_country_of_residence_idx" ON "working_students"("country_of_residence");

-- CreateIndex
CREATE INDEX "working_students_added_at_idx" ON "working_students"("added_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");

-- AddForeignKey
ALTER TABLE "working_students" ADD CONSTRAINT "working_students_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_students" ADD CONSTRAINT "working_students_added_by_admin_fkey" FOREIGN KEY ("added_by_admin") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
