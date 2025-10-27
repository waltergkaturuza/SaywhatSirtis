import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Add conditional logic column with default empty array
    await prisma.$executeRaw`
      ALTER TABLE public.meal_forms 
      ADD COLUMN IF NOT EXISTS conditional_logic JSONB DEFAULT '[]'::jsonb
    `

    // Add indicator mapping column with default empty array  
    await prisma.$executeRaw`
      ALTER TABLE public.meal_forms 
      ADD COLUMN IF NOT EXISTS indicator_mappings JSONB DEFAULT '[]'::jsonb
    `

    // Update existing rows to have the default values
    await prisma.$executeRaw`
      UPDATE public.meal_forms 
      SET conditional_logic = '[]'::jsonb 
      WHERE conditional_logic IS NULL
    `

    await prisma.$executeRaw`
      UPDATE public.meal_forms 
      SET indicator_mappings = '[]'::jsonb 
      WHERE indicator_mappings IS NULL
    `

    // Create indexes for better performance on JSONB queries
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_meal_forms_conditional_logic ON public.meal_forms USING GIN (conditional_logic)
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_meal_forms_indicator_mappings ON public.meal_forms USING GIN (indicator_mappings)
    `

    return NextResponse.json({ success: true, message: "Successfully added conditional logic and indicator mapping columns" })
  } catch (e) {
    console.error("Database schema update error", e)
    return NextResponse.json({ success: false, error: "Failed to update database schema" }, { status: 500 })
  }
}
