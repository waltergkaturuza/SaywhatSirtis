-- AlterTable
ALTER TABLE "public"."assets" ADD COLUMN     "assetType" TEXT,
ADD COLUMN     "assignedEmail" TEXT,
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "barcodeId" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "depreciationMethod" TEXT DEFAULT 'straight-line',
ADD COLUMN     "depreciationRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fundingSource" TEXT,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "insurancePolicy" TEXT,
ADD COLUMN     "insuranceValue" DOUBLE PRECISION,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "rfidTag" TEXT;

-- CreateIndex
CREATE INDEX "assets_department_idx" ON "public"."assets"("department");

-- CreateIndex
CREATE INDEX "assets_assignedTo_idx" ON "public"."assets"("assignedTo");

-- CreateIndex
CREATE INDEX "assets_fundingSource_idx" ON "public"."assets"("fundingSource");

-- CreateIndex
CREATE INDEX "assets_rfidTag_idx" ON "public"."assets"("rfidTag");

-- CreateIndex
CREATE INDEX "assets_qrCode_idx" ON "public"."assets"("qrCode");

-- CreateIndex
CREATE INDEX "assets_barcodeId_idx" ON "public"."assets"("barcodeId");
