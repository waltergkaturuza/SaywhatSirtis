-- HR can create an employee before an administrator issues a login.
ALTER TABLE "public"."employees" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "public"."employees" DROP CONSTRAINT IF EXISTS "employees_userId_fkey";

ALTER TABLE "public"."employees"
  ADD CONSTRAINT "employees_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
