-- Add missing fields to assets table to match frontend form requirements

ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS "assetType" TEXT,
ADD COLUMN IF NOT EXISTS "depreciationRate" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "depreciationMethod" TEXT DEFAULT 'straight-line',
ADD COLUMN IF NOT EXISTS "fundingSource" TEXT,
ADD COLUMN IF NOT EXISTS "department" TEXT,
ADD COLUMN IF NOT EXISTS "assignedTo" TEXT,
ADD COLUMN IF NOT EXISTS "assignedEmail" TEXT,
ADD COLUMN IF NOT EXISTS "rfidTag" TEXT,
ADD COLUMN IF NOT EXISTS "qrCode" TEXT,
ADD COLUMN IF NOT EXISTS "barcodeId" TEXT,
ADD COLUMN IF NOT EXISTS "insuranceValue" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "insurancePolicy" TEXT,
ADD COLUMN IF NOT EXISTS "images" TEXT[], -- Array of image URLs
ADD COLUMN IF NOT EXISTS "documents" TEXT[]; -- Array of document URLs

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_assets_department" ON assets("department");
CREATE INDEX IF NOT EXISTS "idx_assets_assignedTo" ON assets("assignedTo");
CREATE INDEX IF NOT EXISTS "idx_assets_fundingSource" ON assets("fundingSource");
CREATE INDEX IF NOT EXISTS "idx_assets_rfidTag" ON assets("rfidTag");
CREATE INDEX IF NOT EXISTS "idx_assets_qrCode" ON assets("qrCode");
CREATE INDEX IF NOT EXISTS "idx_assets_barcodeId" ON assets("barcodeId");

-- Update existing assets with default values where needed
UPDATE assets 
SET 
  "depreciationRate" = 0,
  "depreciationMethod" = 'straight-line'
WHERE "depreciationRate" IS NULL OR "depreciationMethod" IS NULL;