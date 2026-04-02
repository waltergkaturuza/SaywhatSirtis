-- Optional asset fields aligned with registration / view / edit UI
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "physicalAssetTag" TEXT;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "custodian" TEXT;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "lastAuditDate" TIMESTAMP(3);
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "nextMaintenanceDate" TIMESTAMP(3);
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "procurementType" TEXT;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "expectedLifespan" INTEGER;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "usageType" TEXT;
