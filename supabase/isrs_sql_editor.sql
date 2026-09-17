-- ISRS / IRO — paste into Supabase SQL Editor and Run
-- Safe to re-run: creates missing objects, then upserts demo data.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "Category" AS ENUM ('OCI', 'NRI', 'FOREIGN_STUDENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RegistrationStatus" AS ENUM (
    'REGISTERED',
    'SCANNED',
    'VERIFIED',
    'ADDED_TO_WORKING_DB'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "admins" (
  "id" TEXT PRIMARY KEY,
  "username" TEXT NOT NULL,
  "email" TEXT,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_login" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "registrations" (
  "id" TEXT PRIMARY KEY,
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
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "working_students" (
  "id" TEXT PRIMARY KEY,
  "registration_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "registration_number" TEXT NOT NULL,
  "category" "Category" NOT NULL,
  "country_of_residence" TEXT NOT NULL,
  "phone_number" TEXT NOT NULL,
  "added_by_admin" TEXT NOT NULL,
  "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL,
  "admin_id" TEXT NOT NULL,
  "registration_id" TEXT,
  "details" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Unique indexes / indexes
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "admins_username_key" ON "admins"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "registrations_display_id_key" ON "registrations"("display_id");
CREATE UNIQUE INDEX IF NOT EXISTS "registrations_registration_token_key" ON "registrations"("registration_token");
CREATE UNIQUE INDEX IF NOT EXISTS "registrations_registration_number_key" ON "registrations"("registration_number");
CREATE INDEX IF NOT EXISTS "registrations_status_idx" ON "registrations"("status");
CREATE INDEX IF NOT EXISTS "registrations_category_idx" ON "registrations"("category");
CREATE INDEX IF NOT EXISTS "registrations_country_of_residence_idx" ON "registrations"("country_of_residence");
CREATE INDEX IF NOT EXISTS "registrations_created_at_idx" ON "registrations"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "working_students_registration_id_key" ON "working_students"("registration_id");
CREATE INDEX IF NOT EXISTS "working_students_registration_number_idx" ON "working_students"("registration_number");
CREATE INDEX IF NOT EXISTS "working_students_category_idx" ON "working_students"("category");
CREATE INDEX IF NOT EXISTS "working_students_country_of_residence_idx" ON "working_students"("country_of_residence");
CREATE INDEX IF NOT EXISTS "working_students_added_at_idx" ON "working_students"("added_at");

CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_admin_id_idx" ON "audit_logs"("admin_id");

-- ---------------------------------------------------------------------------
-- Foreign keys
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE "working_students"
    ADD CONSTRAINT "working_students_registration_id_fkey"
    FOREIGN KEY ("registration_id") REFERENCES "registrations"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "working_students"
    ADD CONSTRAINT "working_students_added_by_admin_fkey"
    FOREIGN KEY ("added_by_admin") REFERENCES "admins"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_admin_id_fkey"
    FOREIGN KEY ("admin_id") REFERENCES "admins"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_registration_id_fkey"
    FOREIGN KEY ("registration_id") REFERENCES "registrations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Keep Prisma in sync if you later run `prisma migrate deploy`
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count"
)
SELECT
  '20240917100000_init',
  'manual-supabase-sql-editor',
  NOW(),
  '20240917100000_init',
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '20240917100000_init'
);

-- ---------------------------------------------------------------------------
-- Seed: admin  (username: admin  /  password: terminal-admin-1984)
-- bcrypt hash — do not store a plaintext password in this table
-- ---------------------------------------------------------------------------
INSERT INTO "admins" ("id", "username", "email", "password_hash")
VALUES (
  'admin_seed_iro_001',
  'admin',
  'admin@isrs.local',
  '$2b$12$ajUtxUIV0qsi4DRf2bPSduf/EPIrREXDA0fKZhhm2lEcWWdooTYQW'
)
ON CONFLICT ("username") DO UPDATE
SET
  "email" = EXCLUDED."email",
  "password_hash" = EXCLUDED."password_hash";

-- ---------------------------------------------------------------------------
-- Seed: demo registrations
-- ---------------------------------------------------------------------------
INSERT INTO "registrations" (
  "id", "display_id", "registration_token", "name", "registration_number",
  "category", "country_of_residence", "phone_number", "status", "is_demo", "updated_at"
)
VALUES
  (
    'reg_demo_001',
    'REG-DEMO1001',
    '57313c28-a571-448d-a74d-5aafda328b1f',
    '[DEMO] Anika Sharma',
    'DEMO-OCI-1001',
    'OCI',
    'United States',
    '+12025550101',
    'REGISTERED',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'reg_demo_002',
    'REG-DEMO1002',
    '7b14bb1e-1793-44e1-bff1-afdbe06ad2e6',
    '[DEMO] Kenji Watanabe',
    'DEMO-FS-1002',
    'FOREIGN_STUDENT',
    'Japan',
    '+81312345678',
    'SCANNED',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'reg_demo_003',
    'REG-DEMO1003',
    '000aefaa-85e7-46fb-b755-1f9ccecced80',
    '[DEMO] Priya Patel',
    'DEMO-NRI-1003',
    'NRI',
    'Canada',
    '+14165550123',
    'ADDED_TO_WORKING_DB',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'reg_demo_004',
    'REG-DEMO1004',
    '797c3ffa-b19d-4317-bcad-13a42d19efe2',
    '[DEMO] Luca Rossi',
    'DEMO-NRI-1004',
    'NRI',
    'Italy',
    '+390612345678',
    'REGISTERED',
    true,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("registration_number") DO NOTHING;

INSERT INTO "working_students" (
  "id", "registration_id", "name", "registration_number",
  "category", "country_of_residence", "phone_number", "added_by_admin"
)
SELECT
  'work_demo_003',
  r."id",
  r."name",
  r."registration_number",
  r."category",
  r."country_of_residence",
  r."phone_number",
  a."id"
FROM "registrations" r
CROSS JOIN "admins" a
WHERE r."registration_number" = 'DEMO-NRI-1003'
  AND a."username" = 'admin'
ON CONFLICT ("registration_id") DO NOTHING;

INSERT INTO "audit_logs" ("id", "action", "admin_id", "registration_id", "details")
SELECT
  'audit_demo_003',
  'ADD_TO_WORKING_DB',
  a."id",
  r."id",
  'Seeded demo verification'
FROM "registrations" r
CROSS JOIN "admins" a
WHERE r."registration_number" = 'DEMO-NRI-1003'
  AND a."username" = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM "audit_logs" WHERE "id" = 'audit_demo_003'
  );

-- ---------------------------------------------------------------------------
-- Optional: wipe demo rows before production
-- DELETE FROM "audit_logs" WHERE "registration_id" IN (SELECT "id" FROM "registrations" WHERE "is_demo" = true);
-- DELETE FROM "working_students" WHERE "registration_id" IN (SELECT "id" FROM "registrations" WHERE "is_demo" = true);
-- DELETE FROM "registrations" WHERE "is_demo" = true;
-- ---------------------------------------------------------------------------
