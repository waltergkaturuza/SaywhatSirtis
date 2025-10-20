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
    const indicators = await prisma.meal_indicators.findMany({ orderBy: { createdAt: 'desc' } })
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
    const body = await req.json()
    const created = await prisma.meal_indicators.create({
      data: {
        projectId: body.projectId || null,
        code: body.code,
        name: body.name,
        level: body.level,
        baseline: body.baseline ?? null,
        target: body.target ?? null,
        unit: body.unit || null,
        disaggregation: body.disaggregation || null,
        mapping: body.mapping || null
      }
    })
    return NextResponse.json({ success: true, data: created })
  } catch (e) {
    console.error("MEAL indicator create error", e)
    return NextResponse.json({ success: false, error: "Failed to create indicator" }, { status: 500 })
  }
}


