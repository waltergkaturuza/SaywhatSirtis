import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const forms = await prisma.$queryRaw<any[]>`
      select id, name, description, project_id as "projectId", version,
             language, status, created_by as "createdBy", published_at as "publishedAt",
             schema, created_at as "createdAt", updated_at as "updatedAt"
      from public.meal_forms
      order by created_at desc
    `
    return NextResponse.json({ success: true, data: forms })
  } catch (e) {
    console.error("MEAL forms list error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch forms" }, { status: 500 })
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
    const created = await prisma.$queryRaw<any[]>`
      insert into public.meal_forms
        (name, description, project_id, language, status, created_by, schema)
      values
        (${body.name}, ${body.description ?? null}, ${body.projectId ?? null},
         ${body.language ?? 'en'}, ${body.status ?? 'draft'},
         ${null}, ${JSON.stringify(body.schema || {})}::jsonb)
      returning *
    `
    return NextResponse.json({ success: true, data: created?.[0] })
  } catch (e) {
    console.error("MEAL form create error", e)
    return NextResponse.json({ success: false, error: "Failed to create form" }, { status: 500 })
  }
}


