import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, ctx: any) {
  try {
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    
    // Get form and check if it's published
    const form = (await prisma.$queryRaw<any[]>`
      select id, name, description, schema, status, created_at, updated_at
      from public.meal_forms 
      where id = ${id}::uuid and status = 'published'
    `)?.[0]
    
    if (!form) {
      return NextResponse.json({ 
        success: false, 
        error: "Form not found or not published" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: form })
  } catch (e) {
    console.error("Public MEAL form fetch error", e)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch form" 
    }, { status: 500 })
  }
}
