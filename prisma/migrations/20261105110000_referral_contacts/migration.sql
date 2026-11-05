-- AlterTable
ALTER TABLE "public"."referral_organizations" ADD COLUMN IF NOT EXISTS "emails" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "public"."referral_organizations" ADD COLUMN IF NOT EXISTS "websites" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "public"."referral_organizations" ADD COLUMN IF NOT EXISTS "contactPersons" JSONB NOT NULL DEFAULT '[]';

UPDATE "public"."referral_organizations" SET "emails" = ARRAY["email"] WHERE "email" IS NOT NULL AND COALESCE(cardinality("emails"), 0) = 0;
UPDATE "public"."referral_organizations" SET "websites" = ARRAY["website"] WHERE "website" IS NOT NULL AND COALESCE(cardinality("websites"), 0) = 0;
