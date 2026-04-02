-- AlterTable
ALTER TABLE "public"."risk_assessments" ADD COLUMN IF NOT EXISTS "nextAssessmentDate" TIMESTAMP(3);
