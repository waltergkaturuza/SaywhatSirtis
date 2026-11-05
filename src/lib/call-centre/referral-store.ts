import type { Session } from 'next-auth'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hasAdminAccess } from '@/lib/admin-auth'
import { referralDirectory } from '@/data/referral-directory'

type CallCentreSession = {
  user?: {
    permissions?: string[] | null
    roles?: string[] | null
  } | null
} | null

export type ContactPerson = {
  name: string
  role?: string
  phone?: string
  email?: string
}

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
    emails: string[]
    websites: string[]
    people: ContactPerson[]
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
  `CREATE INDEX IF NOT EXISTS "call_centre_referrals_createdAt_idx" ON "public"."call_centre_referrals"("createdAt")`,
  `ALTER TABLE "public"."referral_organizations" ADD COLUMN IF NOT EXISTS "emails" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
  `ALTER TABLE "public"."referral_organizations" ADD COLUMN IF NOT EXISTS "websites" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
  `ALTER TABLE "public"."referral_organizations" ADD COLUMN IF NOT EXISTS "contactPersons" JSONB NOT NULL DEFAULT '[]'`,
  `UPDATE "public"."referral_organizations" SET "emails" = ARRAY["email"] WHERE "email" IS NOT NULL AND COALESCE(cardinality("emails"), 0) = 0`,
  `UPDATE "public"."referral_organizations" SET "websites" = ARRAY["website"] WHERE "website" IS NOT NULL AND COALESCE(cardinality("websites"), 0) = 0`,
  `ALTER TABLE "public"."call_centre_referrals" ALTER COLUMN "organizationId" DROP NOT NULL`,
  `ALTER TABLE "public"."call_centre_referrals" ADD COLUMN IF NOT EXISTS "organizationName" TEXT`,
  `ALTER TABLE "public"."call_centre_referrals" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'MANUAL'`,
  `CREATE INDEX IF NOT EXISTS "call_centre_referrals_source_idx" ON "public"."call_centre_referrals"("source")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "call_centre_referrals_call_case_key" ON "public"."call_centre_referrals"("caseNumber") WHERE "source" = 'CALL'`
]

let readyPromise: Promise<void> | null = null

async function prepareReferralTables() {
  for (const statement of TABLE_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement)
  }

  const existing = await prisma.referral_organizations.count()
  if (existing > 0) return

  await seedReferralOrganizations()
}

async function seedReferralOrganizations() {
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
      emails: org.contact.email ? [org.contact.email] : [],
      websites: org.contact.website ? [org.contact.website] : [],
      contactPersons: [],
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

export function canManageReferralDirectory(session: Session | null | undefined) {
  return hasAdminAccess(session) || Boolean(session?.user?.permissions?.includes('callcentre.admin'))
}

const listFrom = (value: unknown, max = 30) => {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\n,]/) : []
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))].slice(0, max).map((item) => item.slice(0, 120))
}

const optionalText = (value: unknown, max = 500) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WEBSITE_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i
const PHONE_PATTERN = /^[+\d][\d\s()-]{5,}$/

export function readContactPersons(value: unknown): ContactPerson[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
      return {
        name: optionalText(row.name, 120) || '',
        role: optionalText(row.role, 120) || undefined,
        phone: optionalText(row.phone, 50) || undefined,
        email: optionalText(row.email, 200) || undefined
      }
    })
    .filter((person) => person.name || person.role || person.phone || person.email)
}

export function parseOrganizationInput(body: Record<string, unknown>) {
  const errors: Record<string, string> = {}
  const name = optionalText(body.name, 200)
  const phones = listFrom(body.phones, 20)
  const emails = listFrom(body.emails ?? body.email, 20).map((email) => email.toLowerCase())
  const websites = listFrom(body.websites ?? body.website, 10)
  const contactPersons = readContactPersons(body.contactPersons).slice(0, 20)

  if (!name) errors.name = 'Enter the organisation name'
  phones.forEach((phone, index) => {
    if (!PHONE_PATTERN.test(phone)) errors[`phones.${index}`] = 'Use digits, spaces, brackets, dashes and a leading +'
  })
  emails.forEach((email, index) => {
    if (!EMAIL_PATTERN.test(email)) errors[`emails.${index}`] = 'Enter a valid email address'
  })
  websites.forEach((website, index) => {
    if (!WEBSITE_PATTERN.test(website)) errors[`websites.${index}`] = 'Enter a valid website address'
  })
  contactPersons.forEach((person, index) => {
    if (!person.name) errors[`contactPersons.${index}.name`] = 'Enter the contact person name'
    if (person.phone && !PHONE_PATTERN.test(person.phone)) errors[`contactPersons.${index}.phone`] = 'Enter a valid phone number'
    if (person.email && !EMAIL_PATTERN.test(person.email)) errors[`contactPersons.${index}.email`] = 'Enter a valid email address'
  })

  return {
    errors,
    data: {
      name: name || '',
      description: optionalText(body.description, 1000),
      focusAreas: listFrom(body.focusAreas),
      categories: listFrom(body.categories),
      address: optionalText(body.address, 300),
      city: optionalText(body.city, 120),
      province: optionalText(body.province, 120),
      phones,
      emails,
      websites,
      email: emails[0] || null,
      website: websites[0] || null,
      contactPersons: JSON.parse(JSON.stringify(contactPersons)) as Prisma.InputJsonValue,
      isActive: body.isActive === undefined ? true : body.isActive === true
    }
  }
}

export function organizationIdFromName(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'organisation'
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`
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
  emails?: string[] | null
  websites?: string[] | null
  contactPersons?: unknown
}): ReferralOrganizationDto {
  const emails = org.emails?.length ? org.emails : org.email ? [org.email] : []
  const websites = org.websites?.length ? org.websites : org.website ? [org.website] : []
  return {
    id: org.id,
    name: org.name,
    description: org.description || '',
    focusAreas: org.focusAreas || [],
    categories: org.categories || [],
    contact: {
      address: org.address || undefined,
      phone: org.phones || [],
      email: emails[0],
      website: websites[0],
      emails,
      websites,
      people: readContactPersons(org.contactPersons)
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
        org.categories.some((item) => item.toLowerCase().includes(search)) ||
        org.contact.people.some((person) => person.name.toLowerCase().includes(search))
      )
    ) {
      return false
    }
    return true
  })
}
