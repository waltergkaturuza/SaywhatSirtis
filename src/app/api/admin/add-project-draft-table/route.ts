import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Add ProjectDraft table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ProjectDraft" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "projectCode" TEXT,
          "projectTitle" TEXT,
          "projectGoal" TEXT,
          "description" TEXT,
          "projectLead" TEXT,
          "projectTeam" JSONB,
          "selectedCategories" JSONB,
          "startDate" TEXT,
          "endDate" TEXT,
          "selectedCountries" JSONB,
          "selectedProvinces" JSONB,
          "uploadedDocuments" JSONB,
          "implementingOrganizations" JSONB,
          "selectedFrequencies" JSONB,
          "frequencyDates" JSONB,
          "selectedMethodologies" JSONB,
          "totalBudget" TEXT,
          "fundingSource" TEXT,
          "resultsFramework" JSONB,
          "currentStep" INTEGER NOT NULL DEFAULT 1,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ProjectDraft_pkey" PRIMARY KEY ("id")
      )
    `

    // Create index on userId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ProjectDraft_userId_idx" ON "ProjectDraft"("userId")
    `

    // Add foreign key constraint (with error handling)
    try {
      await prisma.$executeRaw`
        ALTER TABLE "ProjectDraft" 
        ADD CONSTRAINT "ProjectDraft_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `
    } catch (fkError) {
      // Foreign key constraint might already exist, that's okay
      console.log('Foreign key constraint may already exist:', fkError)
    }

    // Create update trigger function
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    // Create trigger
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS update_project_draft_updated_at ON "ProjectDraft"
    `

    await prisma.$executeRaw`
      CREATE TRIGGER update_project_draft_updated_at 
          BEFORE UPDATE ON "ProjectDraft" 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `

    return NextResponse.json({ success: true, message: "ProjectDraft table created successfully" })
  } catch (e) {
    console.error("Database schema update error", e)
    return NextResponse.json({ success: false, error: "Failed to update database schema" }, { status: 500 })
  }
}
