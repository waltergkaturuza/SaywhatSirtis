-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."referral_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "email" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "referral_organizations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "referral_organizations_province_idx" ON "public"."referral_organizations"("province");
CREATE INDEX IF NOT EXISTS "referral_organizations_isActive_idx" ON "public"."referral_organizations"("isActive");

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."call_centre_referrals" (
    "id" TEXT NOT NULL,
    "referralNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "caseNumber" TEXT,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientAge" TEXT,
    "clientGender" TEXT,
    "clientProvince" TEXT,
    "reason" TEXT NOT NULL,
    "servicesRequested" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "call_centre_referrals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "call_centre_referrals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."referral_organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "call_centre_referrals_referralNumber_key" ON "public"."call_centre_referrals"("referralNumber");
CREATE INDEX IF NOT EXISTS "call_centre_referrals_organizationId_idx" ON "public"."call_centre_referrals"("organizationId");
CREATE INDEX IF NOT EXISTS "call_centre_referrals_caseNumber_idx" ON "public"."call_centre_referrals"("caseNumber");
CREATE INDEX IF NOT EXISTS "call_centre_referrals_status_idx" ON "public"."call_centre_referrals"("status");
CREATE INDEX IF NOT EXISTS "call_centre_referrals_createdAt_idx" ON "public"."call_centre_referrals"("createdAt");
