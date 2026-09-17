-- ISRS / IRO — Row Level Security
-- Paste into Supabase SQL Editor and Run.
--
-- What this does:
--   1. Turns RLS on for every app table.
--   2. Adds NO policies for anon / authenticated.
--   Result: the public Supabase API (anon key, Table REST, GraphQL)
--   cannot read or write student/admin data.
--
-- Prisma / Next.js still work. They connect as the database user
-- (postgres), which has BYPASSRLS. That is the intended split:
--   browser  → locked
--   server   → full access via Prisma
--
-- Do NOT add policies like USING (true). That would publish all rows.

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "working_students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Table owners without BYPASSRLS also obey RLS
ALTER TABLE "admins" FORCE ROW LEVEL SECURITY;
ALTER TABLE "registrations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "working_students" FORCE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Drop any overly-open policies if you created them while testing
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "public_read_admins" ON "admins";
DROP POLICY IF EXISTS "public_read_registrations" ON "registrations";
DROP POLICY IF EXISTS "public_read_working_students" ON "working_students";
DROP POLICY IF EXISTS "public_read_audit_logs" ON "audit_logs";
DROP POLICY IF EXISTS "Allow all" ON "admins";
DROP POLICY IF EXISTS "Allow all" ON "registrations";
DROP POLICY IF EXISTS "Allow all" ON "working_students";
DROP POLICY IF EXISTS "Allow all" ON "audit_logs";
DROP POLICY IF EXISTS "Enable read access for all users" ON "admins";
DROP POLICY IF EXISTS "Enable read access for all users" ON "registrations";
DROP POLICY IF EXISTS "Enable read access for all users" ON "working_students";
DROP POLICY IF EXISTS "Enable read access for all users" ON "audit_logs";

-- ---------------------------------------------------------------------------
-- Explicit deny: revoke Data API grants
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE "admins" FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE "registrations" FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE "working_students" FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE "audit_logs" FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE "admins" TO postgres, service_role;
GRANT ALL ON TABLE "registrations" TO postgres, service_role;
GRANT ALL ON TABLE "working_students" TO postgres, service_role;
GRANT ALL ON TABLE "audit_logs" TO postgres, service_role;

-- ---------------------------------------------------------------------------
-- Optional later: if you add Supabase Auth for coordinators, replace
-- the deny-all model with policies like these (DO NOT run until Auth exists):
--
-- CREATE POLICY "coordinator_select_registrations"
--   ON "registrations"
--   FOR SELECT
--   TO authenticated
--   USING (auth.role() = 'authenticated');
--
-- CREATE POLICY "coordinator_select_working"
--   ON "working_students"
--   FOR SELECT
--   TO authenticated
--   USING (auth.role() = 'authenticated');
--
-- Never allow anon to SELECT phone numbers or tokens.
-- Never allow the browser to INSERT into working_students.
-- Verification must stay on POST /api/admin/verify.
-- ---------------------------------------------------------------------------
