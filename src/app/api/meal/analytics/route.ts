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

    // Get key metrics
    const metrics = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(DISTINCT ms.form_id) as active_forms,
        COUNT(DISTINCT mi.id) as total_indicators,
        ROUND(
          COUNT(CASE WHEN ms.metadata->>'status' = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1
        ) as completion_rate
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_indicators mi ON 1=1
    `

    // Get regional performance
    const regionalPerformance = await prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN ms.metadata->>'country' IS NOT NULL AND ms.metadata->>'country' != 'Unknown' THEN ms.metadata->>'country'
          WHEN ms.metadata->>'region' IS NOT NULL AND ms.metadata->>'region' != 'Unknown' THEN ms.metadata->>'region'
          WHEN ms.metadata->>'city' IS NOT NULL AND ms.metadata->>'city' != 'Unknown' THEN ms.metadata->>'city'
          WHEN ms.latitude IS NOT NULL AND ms.longitude IS NOT NULL THEN 
            CASE 
              WHEN ms.latitude BETWEEN -18 AND -15 AND ms.longitude BETWEEN 30 AND 33 THEN 'Harare Province'
              WHEN ms.latitude BETWEEN -40 AND -35 AND ms.longitude BETWEEN 140 AND 150 THEN 'Victoria, Australia'
              ELSE 'GPS Location'
            END
          ELSE 'Unknown'
        END as region,
        COUNT(*) as submission_count,
        COALESCE(
          ROUND(
            COUNT(CASE WHEN ms.metadata->>'status' = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1
          ), 0
        ) as completion_rate
      FROM public.meal_submissions ms
      GROUP BY 
        CASE 
          WHEN ms.metadata->>'country' IS NOT NULL AND ms.metadata->>'country' != 'Unknown' THEN ms.metadata->>'country'
          WHEN ms.metadata->>'region' IS NOT NULL AND ms.metadata->>'region' != 'Unknown' THEN ms.metadata->>'region'
          WHEN ms.metadata->>'city' IS NOT NULL AND ms.metadata->>'city' != 'Unknown' THEN ms.metadata->>'city'
          WHEN ms.latitude IS NOT NULL AND ms.longitude IS NOT NULL THEN 
            CASE 
              WHEN ms.latitude BETWEEN -18 AND -15 AND ms.longitude BETWEEN 30 AND 33 THEN 'Harare Province'
              WHEN ms.latitude BETWEEN -40 AND -35 AND ms.longitude BETWEEN 140 AND 150 THEN 'Victoria, Australia'
              ELSE 'GPS Location'
            END
          ELSE 'Unknown'
        END
      ORDER BY submission_count DESC
      LIMIT 10
    `

    // Get gender distribution with safe percentage calculation
    const genderDistribution = await prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE(ms.data->>'gender', ms.data->>'sex', 'Unknown') as gender,
        COUNT(*) as count,
        COALESCE(
          ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.meal_submissions), 0), 1),
          0
        ) as percentage
      FROM public.meal_submissions ms
      GROUP BY ms.data->>'gender', ms.data->>'sex'
      ORDER BY count DESC
    `

    // Get age groups with safe percentage calculation
    const ageGroups = await prisma.$queryRaw<any[]>`
      SELECT 
        age_group,
        count,
        percentage
      FROM (
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
          COALESCE(
            ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.meal_submissions), 0), 1),
            0
          ) as percentage
        FROM public.meal_submissions ms
        WHERE ms.data->>'age' IS NOT NULL
          AND ms.data->>'age' ~ '^[0-9]+$'
        GROUP BY 
          CASE 
            WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 18 AND 25 THEN '18-25'
            WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 26 AND 35 THEN '26-35'
            WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 36 AND 45 THEN '36-45'
            WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 46 AND 55 THEN '46-55'
            WHEN CAST(ms.data->>'age' AS INTEGER) BETWEEN 56 AND 65 THEN '56-65'
            ELSE '65+'
          END
      ) grouped_ages
      ORDER BY 
        CASE 
          WHEN age_group = '18-25' THEN 1
          WHEN age_group = '26-35' THEN 2
          WHEN age_group = '36-45' THEN 3
          WHEN age_group = '46-55' THEN 4
          WHEN age_group = '56-65' THEN 5
          WHEN age_group = '65+' THEN 6
        END
    `

    // Get trend analysis
    const trendAnalysis = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(ms.submitted_at) as date,
        COUNT(*) as submissions
      FROM public.meal_submissions ms
      GROUP BY DATE(ms.submitted_at)
      ORDER BY date DESC
      LIMIT 30
    `

    // Get top performing forms with safe completion rate
    const topForms = await prisma.$queryRaw<any[]>`
      SELECT 
        mf.name as form_name,
        COUNT(*) as submission_count,
        COALESCE(
          ROUND(
            COUNT(CASE WHEN ms.metadata->>'status' = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1
          ),
          0
        ) as completion_rate
      FROM public.meal_submissions ms
      LEFT JOIN public.meal_forms mf ON ms.form_id = mf.id
      GROUP BY mf.name
      ORDER BY submission_count DESC
      LIMIT 10
    `

    // Get indicator progress (simplified for now)
    const indicatorProgress = await prisma.$queryRaw<any[]>`
      SELECT 
        mi.name as indicator_name,
        mi.baseline,
        mi.target,
        mi.baseline as current_value,
        0 as progress_percentage
      FROM public.meal_indicators mi
      ORDER BY mi.name
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

    // Convert BigInt values to numbers and fix NaN for JSON serialization
    const convertBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (typeof obj === 'bigint') return Number(obj)
      if (typeof obj === 'number' && isNaN(obj)) return 0 // Fix NaN values
      if (Array.isArray(obj)) return obj.map(convertBigInt)
      if (typeof obj === 'object') {
        const converted: any = {}
        for (const [key, value] of Object.entries(obj)) {
          // Fix percentage fields specifically
          if (key === 'percentage' && (value === null || isNaN(Number(value)))) {
            converted[key] = 0
          } else {
            converted[key] = convertBigInt(value)
          }
        }
        return converted
      }
      return obj
    }

    return NextResponse.json({ 
      success: true, 
      data: convertBigInt(result)
    })
  } catch (e) {
    console.error("MEAL analytics fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}