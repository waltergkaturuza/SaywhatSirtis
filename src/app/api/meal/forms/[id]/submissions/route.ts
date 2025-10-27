import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    const list = await prisma.$queryRaw<any[]>`
      select * from public.meal_submissions
      where form_id = ${id}::uuid
      order by submitted_at desc
    `
    return NextResponse.json({ success: true, data: list })
  } catch (e) {
    console.error("MEAL submissions list error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const roles: string[] = (session.user as any)?.roles || []
    const canSubmit = roles.length > 0 // allow any authenticated role; refine later
    if (!canSubmit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    const { id } = ctx.params?.then ? await ctx.params : ctx.params

    // Extract comprehensive metadata from request
    const clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   req.headers.get('cf-connecting-ip') ||
                   req.headers.get('x-client-ip') ||
                   'Unknown'
    
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const acceptLanguage = req.headers.get('accept-language') || 'Unknown'
    const referer = req.headers.get('referer') || 'Unknown'
    const origin = req.headers.get('origin') || 'Unknown'
    
    // Parse user agent for device information
    const deviceInfo = {
      user_agent: userAgent,
      platform: getPlatformFromUserAgent(userAgent),
      browser: getBrowserFromUserAgent(userAgent),
      os: getOSFromUserAgent(userAgent),
      language: acceptLanguage.split(',')[0] || 'en',
      screen_resolution: body.screenResolution || 'Unknown',
      timezone: body.timezone || 'Unknown',
      connection_type: body.connectionType || 'Unknown',
      is_mobile: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
      is_tablet: /iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(userAgent)
    }

    // Enhanced metadata collection
    const enhancedMetadata = {
      ip_address: clientIP,
      location: body.location || 'Unknown Location',
      country: body.country || 'Unknown',
      region: body.region || 'Unknown',
      city: body.city || 'Unknown',
      timezone: body.timezone || 'Unknown',
      submission_source: body.submissionSource || 'Web Form',
      completion_time: body.completionTime || 'Unknown',
      form_version: body.formVersion || '1.0',
      status: 'completed',
      referer: referer,
      origin: origin,
      timestamp: new Date().toISOString(),
      ...(body.metadata || {})
    }

    const created = await prisma.$queryRaw<any[]>`
      insert into public.meal_submissions
        (form_id, project_id, user_id, user_email, submitted_by, latitude, longitude, 
         attachments, data, metadata, device_info)
      values
        (${id}::uuid, ${body.projectId ?? null}, ${session.user?.id ?? null}, 
         ${session.user?.email ?? null}, ${session.user?.name ?? 'Anonymous'},
         ${body.latitude ?? null}, ${body.longitude ?? null},
         ${body.attachments ? JSON.stringify(body.attachments) : null}::jsonb,
         ${JSON.stringify(body.data || {})}::jsonb,
         ${JSON.stringify(enhancedMetadata)}::jsonb,
         ${JSON.stringify(deviceInfo)}::jsonb)
      returning *
    `

    // Process indicator mappings if provided
    if (body.indicatorMappings && Array.isArray(body.indicatorMappings) && body.indicatorMappings.length > 0) {
      try {
        await processIndicatorMappings(body.indicatorMappings, body.data, body.projectId, session.user)
      } catch (err) {
        console.error('Error processing indicator mappings:', err)
        // Don't fail the submission if indicator processing fails
      }
    }

    return NextResponse.json({ success: true, data: created?.[0] })
  } catch (e) {
    console.error("MEAL submission create error", e)
    return NextResponse.json({ success: false, error: "Failed to submit" }, { status: 500 })
  }
}

// Process indicator mappings to automatically update indicator values
async function processIndicatorMappings(
  mappings: any[], 
  formData: any, 
  projectId: string | null,
  user: any
) {
  for (const mapping of mappings) {
    try {
      const fieldValue = formData[mapping.fieldKey]
      if (fieldValue === null || fieldValue === undefined) continue

      // Get current indicator value
      const indicator = await prisma.$queryRaw<any[]>`
        SELECT current, baseline, target FROM public.meal_indicators
        WHERE id = ${mapping.indicatorId}::uuid
        LIMIT 1
      `

      if (!indicator || !indicator[0]) continue

      let newValue = indicator[0].current || 0

      // Calculate new value based on calculation type
      switch (mapping.calculationType) {
        case 'sum':
          newValue += Number(fieldValue) || 0
          break
        case 'count':
          newValue += 1
          break
        case 'average':
          // For average, we need to track total and count separately
          // This is simplified - in production, use a more sophisticated approach
          newValue = ((newValue + Number(fieldValue)) / 2)
          break
        case 'max':
          newValue = Math.max(newValue, Number(fieldValue) || 0)
          break
        case 'min':
          newValue = indicator[0].current === null ? Number(fieldValue) : Math.min(newValue, Number(fieldValue) || 0)
          break
      }

      // Update the indicator
      await prisma.$queryRaw`
        UPDATE public.meal_indicators
        SET current = ${newValue},
            last_updated_at = NOW(),
            last_updated_by = ${user?.id || null}::uuid
        WHERE id = ${mapping.indicatorId}::uuid
      `

      console.log(`Updated indicator ${mapping.indicatorId} with ${mapping.calculationType}: ${newValue}`)
    } catch (err) {
      console.error(`Failed to process mapping for indicator ${mapping.indicatorId}:`, err)
      // Continue processing other mappings
    }
  }
}

// Helper functions to parse user agent
function getPlatformFromUserAgent(userAgent: string): string {
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS'
  if (/Linux/i.test(userAgent)) return 'Linux'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
  return 'Unknown'
}

function getBrowserFromUserAgent(userAgent: string): string {
  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) return 'Chrome'
  if (/Firefox/i.test(userAgent)) return 'Firefox'
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari'
  if (/Edge/i.test(userAgent)) return 'Edge'
  if (/Opera/i.test(userAgent)) return 'Opera'
  return 'Unknown'
}

function getOSFromUserAgent(userAgent: string): string {
  if (/Windows NT 10.0/i.test(userAgent)) return 'Windows 10'
  if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1'
  if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7'
  if (/Mac OS X 10.15/i.test(userAgent)) return 'macOS Catalina'
  if (/Mac OS X 10.14/i.test(userAgent)) return 'macOS Mojave'
  if (/Android 11/i.test(userAgent)) return 'Android 11'
  if (/Android 10/i.test(userAgent)) return 'Android 10'
  if (/iPhone OS 14/i.test(userAgent)) return 'iOS 14'
  if (/iPhone OS 13/i.test(userAgent)) return 'iOS 13'
  return 'Unknown'
}


