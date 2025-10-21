import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    const body = await req.json()
    
    // Get client IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    // First check if form exists and is published
    const form = (await prisma.$queryRaw<any[]>`
      select id, status from public.meal_forms 
      where id = ${id}::uuid and status = 'published'
    `)?.[0]
    
    if (!form) {
      return NextResponse.json({ 
        success: false, 
        error: "Form not found or not published" 
      }, { status: 404 })
    }
    
    // Extract GPS coordinates from form data
    let latitude = null
    let longitude = null
    
    if (body.data?.gps_location?.lat && body.data?.gps_location?.lng) {
      latitude = body.data.gps_location.lat
      longitude = body.data.gps_location.lng
    } else if (body.data?.gps_latitude && body.data?.gps_longitude) {
      latitude = parseFloat(body.data.gps_latitude)
      longitude = parseFloat(body.data.gps_longitude)
    }
    
    // Extract attachments from form data (photos, files, etc.)
    const attachments: Record<string, any> = {}
    const formData = body.data || {}
    
    // Look for photo fields and other file attachments
    Object.keys(formData).forEach(key => {
      const value = formData[key]
      if (typeof value === 'string' && value.startsWith('data:image/')) {
        // This is a base64 image
        attachments[key] = {
          type: 'image',
          data: value,
          filename: `${key}_${Date.now()}.jpg`,
          size: Math.round(value.length * 0.75) // Approximate size from base64
        }
      }
    })
    
    // Create metadata with IP and location info
    const metadata = {
      ip_address: ip,
      location: body.data?.gps_location || body.data?.gps_coordinates || 'Unknown',
      submission_timestamp: body.data?.submission_timestamp || new Date().toISOString(),
      status: 'completed'
    }
    
    // Create submission
    const submission = await prisma.$queryRaw<any[]>`
      insert into public.meal_submissions
        (form_id, data, submitted_at, device_info, latitude, longitude, attachments, metadata)
      values
        (${id}::uuid, ${JSON.stringify(body.data || {})}::jsonb, now(), 
         ${JSON.stringify(body.device_info || {})}::jsonb,
         ${latitude}, ${longitude},
         ${Object.keys(attachments).length > 0 ? JSON.stringify(attachments) : null}::jsonb,
         ${JSON.stringify(metadata)}::jsonb)
      returning *
    `
    
    return NextResponse.json({ 
      success: true, 
      data: submission[0],
      message: "Submission received successfully"
    })
  } catch (e) {
    console.error("Public MEAL submission error", e)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to submit form" 
    }, { status: 500 })
  }
}
