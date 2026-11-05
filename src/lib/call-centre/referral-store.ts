import { prisma } from '@/lib/prisma'
import { referralDirectory } from '@/data/referral-directory'

type CallCentreSession = {
  user?: {
    permissions?: string[] | null
    roles?: string[] | null
  } | null
} | null

export type ReferralOrganizationDto = {
  id: string
  name: string
  description: string
  focusAreas: string[]
  categories: string[]
  contact: {
    address?: string
    phone: string[]
    email?: string
    website?: string
  }
  province?: string
  city?: string
}

const TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "public"."referral_organizations" (
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
  )`,
  `CREATE INDEX IF NOT EXISTS "referral_organizations_province_idx" ON "public"."referral_organizations"("province")`,
  `CREATE INDEX IF NOT EXISTS "referral_organizations_isActive_idx" ON "public"."referral_organizations"("isActive")`,
  `CREATE TABLE IF NOT EXISTS "public"."call_centre_referrals" (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "call_centre_referrals_referralNumber_key" ON "public"."call_centre_referrals"("referralNumber")`,
  `CREATE INDEX IF NOT EXISTS "call_centre_referrals_organizationId_idx" ON "public"."call_centre_referrals"("organizationId")`,
  `CREATE INDEX IF NOT EXISTS "call_centre_referrals_caseNumber_idx" ON "public"."call_centre_referrals"("caseNumber")`,
  `CREATE INDEX IF NOT EXISTS "call_centre_referrals_status_idx" ON "public"."call_centre_referrals"("status")`,
  `CREATE INDEX IF NOT EXISTS "call_centre_referrals_createdAt_idx" ON "public"."call_centre_referrals"("createdAt")`
]

let readyPromise: Promise<void> | null = null

async function prepareReferralTables() {
  for (const statement of TABLE_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement)
  }

  const existing = await prisma.referral_organizations.count()
  if (existing > 0) return

  const now = new Date()
  await prisma.referral_organizations.createMany({
    data: referralDirectory.map((org) => ({
      id: org.id,
      name: org.name,
      description: org.description,
      focusAreas: org.focusAreas,
      categories: org.categories,
      address: org.contact.address || null,
      city: org.city || null,
      province: org.province || null,
      phones: org.contact.phone,
      email: org.contact.email || null,
      website: org.contact.website || null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    })),
    skipDuplicates: true
  })
}

export function ensureReferralTables() {
  if (!readyPromise) {
    readyPromise = prepareReferralTables().catch((error) => {
      readyPromise = null
      throw error
    })
  }
  return readyPromise
}

export function canUseCallCentre(session: CallCentreSession) {
  const permissions = session?.user?.permissions || []
  const roles = (session?.user?.roles || []).map((role) => role.toLowerCase())
  return (
    ['calls.view', 'calls.full_access', 'callcentre.access', 'call_center_full', 'callcentre.officer'].some((permission) =>
      permissions.includes(permission)
    ) || roles.some((role) => ['admin', 'manager', 'advance_user_1'].includes(role))
  )
}

export function toOrganizationDto(org: {
  id: string
  name: string
  description: string | null
  focusAreas: string[]
  categories: string[]
  address: string | null
  city: string | null
  province: string | null
  phones: string[]
  email: string | null
  website: string | null
}): ReferralOrganizationDto {
  return {
    id: org.id,
    name: org.name,
    description: org.description || '',
    focusAreas: org.focusAreas || [],
    categories: org.categories || [],
    contact: {
      address: org.address || undefined,
      phone: org.phones || [],
      email: org.email || undefined,
      website: org.website || undefined
    },
    province: org.province || undefined,
    city: org.city || undefined
  }
}

export async function listReferralOrganizations(filters: { category?: string | null; province?: string | null; search?: string | null } = {}) {
  await ensureReferralTables()
  const rows = await prisma.referral_organizations.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  const category = filters.category && filters.category !== 'all' ? filters.category.toLowerCase() : ''
  const province = filters.province && filters.province !== 'all' ? filters.province.toLowerCase() : ''
  const search = filters.search ? filters.search.toLowerCase() : ''

  return rows.map(toOrganizationDto).filter((org) => {
    if (category && !org.categories.some((item) => item.toLowerCase().includes(category))) return false
    if (province && org.province?.toLowerCase() !== province) return false
    if (
      search &&
      !(
        org.name.toLowerCase().includes(search) ||
        org.description.toLowerCase().includes(search) ||
        org.focusAreas.some((item) => item.toLowerCase().includes(search)) ||
        org.categories.some((item) => item.toLowerCase().includes(search))
      )
    ) {
      return false
    }
    return true
  })
}
