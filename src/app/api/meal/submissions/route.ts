import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MealSubmissionParser } from "@/lib/meal-submission-parser"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canView = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canView) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

    // Fetch submissions with all related data - simplified query without problematic JOINs
    const submissions = await prisma.$queryRaw<any[]>`
      SELECT 
        ms.id,
        ms.form_id,
        ms.project_id,
        ms.user_id,
        ms.user_email,
        ms.submitted_at,
        ms.latitude,
        ms.longitude,
        ms.attachments,
        ms.data,
        ms.metadata,
        ms.device_info,
        mf.name as form_name,
        p.name as project_name
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_forms mf ON ms.form_id::text = mf.id::text
      LEFT JOIN public.projects p ON ms.project_id::text = p.id::text
      ORDER BY ms.submitted_at DESC
      LIMIT 100
    `

    // Transform the data using the comprehensive parser
    const transformedSubmissions = submissions.map(sub => {
      return MealSubmissionParser.parseSubmission(sub)
    })

    return NextResponse.json({ 
      success: true, 
      data: transformedSubmissions,
      total: transformedSubmissions.length
    })
  } catch (e) {
    console.error("MEAL submissions fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch submissions" }, { status: 500 })
  }
}