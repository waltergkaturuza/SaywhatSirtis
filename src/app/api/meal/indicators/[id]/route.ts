import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const { id } = await params
    
    const indicator = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        project_id,
        code,
        name,
        level,
        baseline,
        target,
        current,
        unit,
        status,
        notes,
        last_updated_by,
        last_updated_at,
        disaggregation,
        mapping,
        created_at,
        updated_at
      FROM public.meal_indicators 
      WHERE id = ${id}
    `
    
    if (indicator.length === 0) {
      return NextResponse.json({ success: false, error: "Indicator not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: indicator[0] })
  } catch (e) {
    console.error("MEAL indicator fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch indicator" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    
    const { id } = await params
    const body = await request.json()
    
    // Update the indicator
    const updated = await prisma.$queryRaw<any[]>`
      UPDATE public.meal_indicators 
      SET 
        name = COALESCE(${body.name}, name),
        target = COALESCE(${body.target}, target),
        unit = COALESCE(${body.unit}, unit),
        current = COALESCE(${body.current}, current),
        status = COALESCE(${body.status}, status),
        notes = COALESCE(${body.notes}, notes),
        last_updated_by = ${session.user?.email || 'Unknown'},
        last_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Indicator not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: updated[0] })
  } catch (e) {
    console.error("MEAL indicator update error", e)
    return NextResponse.json({ success: false, error: "Failed to update indicator" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    
    const { id } = await params
    
    await prisma.$queryRaw`
      DELETE FROM public.meal_indicators 
      WHERE id = ${id}
    `
    
    return NextResponse.json({ success: true, message: "Indicator deleted successfully" })
  } catch (e) {
    console.error("MEAL indicator delete error", e)
    return NextResponse.json({ success: false, error: "Failed to delete indicator" }, { status: 500 })
  }
}
