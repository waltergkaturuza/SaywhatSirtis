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

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'all'
    const projectId = searchParams.get('projectId') || 'all'

    // Calculate date range based on period
    let dateFilter = ''
    if (period === 'monthly') {
      dateFilter = `AND ms.submitted_at >= NOW() - INTERVAL '30 days'`
    } else if (period === 'weekly') {
      dateFilter = `AND ms.submitted_at >= NOW() - INTERVAL '7 days'`
    } else if (period === 'daily') {
      dateFilter = `AND ms.submitted_at >= NOW() - INTERVAL '1 day'`
    }

    const projectFilter = projectId !== 'all' ? `AND ms.project_id = '${projectId}'` : ''

    // Get key metrics
    const metrics = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(DISTINCT ms.form_id) as active_forms,
        COUNT(DISTINCT mi.id) as total_indicators,
        ROUND(
          COUNT(CASE WHEN ms.metadata->>'status' = 'completed' THEN 1 END) * 100.0 / COUNT(*), 1
        ) as completion_rate
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_indicators mi ON 1=1
      WHERE 1=1 ${dateFilter} ${projectFilter}
    `

    // Get regional performance
    const regionalPerformance = await prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(ms.metadata->>'location', 'Unknown') as region,
        COUNT(*) as submission_count,
        ROUND(
          COUNT(CASE WHEN ms.metadata->>'status' = 'completed' THEN 1 END) * 100.0 / COUNT(*), 1
        ) as completion_rate
      FROM public.meal_submissions ms
      WHERE 1=1 ${dateFilter} ${projectFilter}
      GROUP BY ms.metadata->>'location'
      ORDER BY submission_count DESC
      LIMIT 10
    `

    // Get gender distribution
    const genderDistribution = await prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(ms.data->>'gender', ms.data->>'sex', 'Unknown') as gender,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.meal_submissions WHERE 1=1 ${dateFilter} ${projectFilter}), 1) as percentage
      FROM public.meal_submissions ms
      WHERE 1=1 ${dateFilter} ${projectFilter}
      GROUP BY ms.data->>'gender', ms.data->>'sex'
      ORDER BY count DESC
    `

    // Get age groups
    const ageGroups = await prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 18 AND 25 THEN '18-25'
          WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 26 AND 35 THEN '26-35'
          WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 36 AND 45 THEN '36-45'
          WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 46 AND 55 THEN '46-55'
          WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 56 AND 65 THEN '56-65'
          ELSE '65+'
        END as age_group,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.meal_submissions WHERE 1=1 ${dateFilter} ${projectFilter}), 1) as percentage
      FROM public.meal_submissions ms
      WHERE 1=1 ${dateFilter} ${projectFilter}
        AND ms.data->>'age' IS NOT NULL
        AND ms.data->>'age' ~ '^[0-9]+$'
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '18-25' THEN 1
          WHEN '26-35' THEN 2
          WHEN '36-45' THEN 3
          WHEN '46-55' THEN 4
          WHEN '56-65' THEN 5
          WHEN '65+' THEN 6
        END
    `

    // Get trend analysis (submissions over time)
    const trendAnalysis = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(ms.submitted_at) as date,
        COUNT(*) as submissions
      FROM public.meal_submissions ms
      WHERE 1=1 ${dateFilter} ${projectFilter}
      GROUP BY DATE(ms.submitted_at)
      ORDER BY date DESC
      LIMIT 30
    `

    // Get top performing forms
    const topForms = await prisma.$queryRaw<any[]>`
      SELECT 
        mf.name as form_name,
        COUNT(*) as submission_count,
        ROUND(
          COUNT(CASE WHEN ms.metadata->>'status' = 'completed' THEN 1 END) * 100.0 / COUNT(*), 1
        ) as completion_rate
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_forms mf ON ms.form_id = mf.id
      WHERE 1=1 ${dateFilter} ${projectFilter}
      GROUP BY mf.name
      ORDER BY submission_count DESC
      LIMIT 10
    `

    // Get indicator progress
    const indicatorProgress = await prisma.$queryRaw<any[]>`
      SELECT 
        mi.name as indicator_name,
        mi.baseline,
        mi.target,
        COALESCE(
          AVG(CAST(ms.data->>mi.mapping->0->>'value' AS NUMERIC)), 
          mi.baseline
        ) as current_value,
        ROUND(
          COALESCE(
            AVG(CAST(ms.data->>mi.mapping->0->>'value' AS NUMERIC)), 
            mi.baseline
          ) * 100.0 / NULLIF(mi.target, 0), 1
        ) as progress_percentage
      FROM public.meal_indicators mi
      LEFT JOIN public.meal_submissions ms ON ms.form_id = mi.mapping->0->>'form_id'
      WHERE 1=1 ${dateFilter} ${projectFilter}
      GROUP BY mi.name, mi.baseline, mi.target, mi.mapping
      ORDER BY progress_percentage DESC
      LIMIT 10
    `

    const result = {
      metrics: metrics[0] || {
        total_submissions: 0,
        active_forms: 0,
        total_indicators: 0,
        completion_rate: 0
      },
      regionalPerformance: regionalPerformance || [],
      genderDistribution: genderDistribution || [],
      ageGroups: ageGroups || [],
      trendAnalysis: trendAnalysis || [],
      topForms: topForms || [],
      indicatorProgress: indicatorProgress || []
    }

    return NextResponse.json({ 
      success: true, 
      data: result
    })
  } catch (e) {
    console.error("MEAL analytics fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
