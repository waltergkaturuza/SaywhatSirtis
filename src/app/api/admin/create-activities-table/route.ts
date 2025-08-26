import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    console.log('Creating activities table...')

    // Execute the SQL to create activities table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "public"."activities" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "dueDate" TIMESTAMP(3),
          "completedAt" TIMESTAMP(3),
          "projectId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
      );
    `

    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS "activities_status_idx" ON "public"."activities"("status");
      CREATE INDEX IF NOT EXISTS "activities_dueDate_idx" ON "public"."activities"("dueDate");
      CREATE INDEX IF NOT EXISTS "activities_projectId_idx" ON "public"."activities"("projectId");
    `

    const createForeignKeySQL = `
      ALTER TABLE "public"."activities" ADD CONSTRAINT IF NOT EXISTS "activities_projectId_fkey" 
      FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    // Execute the SQL commands
    await prisma.$executeRawUnsafe(createTableSQL)
    console.log('Activities table created successfully')

    await prisma.$executeRawUnsafe(createIndexesSQL)
    console.log('Activities table indexes created successfully')

    try {
      await prisma.$executeRawUnsafe(createForeignKeySQL)
      console.log('Activities foreign key constraint created successfully')
    } catch (fkError) {
      console.log('Foreign key constraint might already exist:', fkError)
    }

    // Test if the table was created by counting activities
    const activityCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "public"."activities"`
    console.log('Activities table test successful:', activityCount)

    return NextResponse.json({
      success: true,
      message: "Activities table created successfully",
      activityCount
    })

  } catch (error) {
    console.error('Error creating activities table:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create activities table",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
