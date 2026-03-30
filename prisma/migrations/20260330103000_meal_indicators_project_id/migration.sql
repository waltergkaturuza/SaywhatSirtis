-- AlterTable
ALTER TABLE "meal_indicators" ADD COLUMN "projectId" TEXT;

-- CreateIndex
CREATE INDEX "meal_indicators_projectId_idx" ON "meal_indicators"("projectId");
