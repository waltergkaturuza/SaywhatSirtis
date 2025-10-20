import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    const body = await req.json()
    
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
    
    // Create submission
    const submission = await prisma.$queryRaw<any[]>`
      insert into public.meal_submissions
        (form_id, data, submitted_at, device_info)
      values
        (${id}::uuid, ${JSON.stringify(body.data || {})}::jsonb, now(), ${JSON.stringify(body.device_info || {})}::jsonb)
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
