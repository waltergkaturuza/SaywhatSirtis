-- Create meal_escalation_rules table
CREATE TABLE IF NOT EXISTS "meal_escalation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_escalation_rules_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "meal_escalation_rules_isActive_idx" ON "meal_escalation_rules"("isActive");
CREATE INDEX IF NOT EXISTS "meal_escalation_rules_createdAt_idx" ON "meal_escalation_rules"("createdAt");