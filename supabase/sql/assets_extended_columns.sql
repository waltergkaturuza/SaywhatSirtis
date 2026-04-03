-- Run in Supabase SQL editor (or psql) if these columns are missing on public.assets.
-- Aligns with prisma/schema.prisma model `assets`.

ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "custodian" TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "physicalAssetTag" TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "lastAuditDate" TIMESTAMPTZ;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "nextMaintenanceDate" TIMESTAMPTZ;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "procurementType" TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "expectedLifespan" INTEGER;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "usageType" TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "assignedProgram" TEXT;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS "assignedProject" TEXT;
