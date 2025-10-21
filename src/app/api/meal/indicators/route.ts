import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    
    // Use raw SQL to avoid Prisma schema issues
    const indicators = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        project_id,
        code,
        name,
        level,
        baseline,
        target,
        unit,
        disaggregation,
        mapping,
        created_at,
        updated_at
      FROM public.meal_indicators 
      ORDER BY created_at DESC
    `
    return NextResponse.json({ success: true, data: indicators })
  } catch (e) {
    console.error("MEAL indicators list error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch indicators" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    
    const body = await req.json()
    
    // Generate a unique code if not provided
    const code = body.code || `IND-${Date.now().toString(36).toUpperCase()}`
    
    // Use raw SQL to insert
    const created = await prisma.$queryRaw<any[]>`
      INSERT INTO public.meal_indicators 
        (project_id, code, name, level, baseline, target, unit, disaggregation, mapping, created_at, updated_at)
      VALUES 
        (${body.projectId || null}, ${code}, ${body.name}, ${body.category || body.level || 'output'}, 
         ${body.baseline ?? null}, ${body.target ?? null}, ${body.unit || null}, 
         ${body.disaggregation ? JSON.stringify(body.disaggregation) : null}::jsonb,
         ${body.mapping ? JSON.stringify(body.mapping) : null}::jsonb,
         NOW(), NOW())
      RETURNING *
    `
    return NextResponse.json({ success: true, data: created[0] })
  } catch (e) {
    console.error("MEAL indicator create error", e)
    return NextResponse.json({ success: false, error: "Failed to create indicator" }, { status: 500 })
  }
}


