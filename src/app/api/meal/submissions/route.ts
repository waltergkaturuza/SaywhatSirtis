import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Transform the data for frontend consumption
    const transformedSubmissions = submissions.map(sub => {
      const metadata = sub.metadata || {}
      const deviceInfo = sub.device_info || {}
      
      return {
        id: sub.id,
        formName: sub.form_name || 'Unknown Form',
        projectName: sub.project_name || 'No Project',
        submittedAt: sub.submitted_at,
        ipAddress: metadata.ip_address || 'Unknown',
        location: metadata.location || 'Unknown Location',
        deviceInfo: {
          platform: deviceInfo.platform || 'Unknown',
          userAgent: deviceInfo.user_agent || 'Unknown',
          language: deviceInfo.language || 'Unknown'
        },
        dataSize: `${Math.round(JSON.stringify(sub.data || {}).length / 1024 * 10) / 10} KB`,
        attachments: sub.attachments ? (Array.isArray(sub.attachments) ? sub.attachments.length : Object.keys(sub.attachments).length) : 0,
        attachmentsData: sub.attachments || null,
        completionTime: metadata.completion_time || 'Unknown',
        submittedBy: sub.user_email || 'Anonymous',
        status: metadata.status || 'completed',
        coordinates: sub.latitude && sub.longitude ? `${sub.latitude}, ${sub.longitude}` : null
      }
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