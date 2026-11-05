-- AlterTable
ALTER TABLE "public"."call_centre_referrals" ALTER COLUMN "organizationId" DROP NOT NULL;
ALTER TABLE "public"."call_centre_referrals" ADD COLUMN IF NOT EXISTS "organizationName" TEXT;
ALTER TABLE "public"."call_centre_referrals" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'MANUAL';

CREATE INDEX IF NOT EXISTS "call_centre_referrals_source_idx" ON "public"."call_centre_referrals"("source");
CREATE UNIQUE INDEX IF NOT EXISTS "call_centre_referrals_call_case_key" ON "public"."call_centre_referrals"("caseNumber") WHERE "source" = 'CALL';
