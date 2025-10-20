import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const list = await prisma.$queryRaw<any[]>`
      select * from public.meal_submissions
      where form_id = ${params.id}::uuid
      order by submitted_at desc
    `
    return NextResponse.json({ success: true, data: list })
  } catch (e) {
    console.error("MEAL submissions list error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const roles: string[] = (session.user as any)?.roles || []
    const canSubmit = roles.length > 0 // allow any authenticated role; refine later
    if (!canSubmit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    const created = await prisma.$queryRaw<any[]>`
      insert into public.meal_submissions
        (form_id, project_id, user_id, user_email, latitude, longitude, attachments, data, metadata)
      values
        (${params.id}::uuid, ${body.projectId ?? null}, ${null}, ${session.user?.email ?? null},
         ${body.latitude ?? null}, ${body.longitude ?? null},
         ${body.attachments ? JSON.stringify(body.attachments) : null}::jsonb,
         ${JSON.stringify(body.data || {})}::jsonb,
         ${body.metadata ? JSON.stringify(body.metadata) : null}::jsonb)
      returning *
    `
    return NextResponse.json({ success: true, data: created?.[0] })
  } catch (e) {
    console.error("MEAL submission create error", e)
    return NextResponse.json({ success: false, error: "Failed to submit" }, { status: 500 })
  }
}


