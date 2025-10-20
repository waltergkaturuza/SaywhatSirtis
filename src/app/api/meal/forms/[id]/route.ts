import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    const form = (await prisma.$queryRaw<any[]>`
      select * from public.meal_forms where id = ${id}::uuid
    `)?.[0]
    if (!form) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: form })
  } catch (e) {
    console.error("MEAL form fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch form" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    const body = await req.json()
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    const updated = await prisma.$queryRaw<any[]>`
      update public.meal_forms
      set name = ${body.name},
          description = ${body.description},
          project_id = ${body.projectId},
          language = ${body.language},
          status = ${body.status},
          schema = ${JSON.stringify(body.schema)}::jsonb,
          updated_at = now(),
          published_at = case when ${body.status} = 'published' then now() else published_at end
      where id = ${id}::uuid
      returning *
    `
    return NextResponse.json({ success: true, data: updated?.[0] })
  } catch (e) {
    console.error("MEAL form update error", e)
    return NextResponse.json({ success: false, error: "Failed to update form" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const { id } = ctx.params?.then ? await ctx.params : ctx.params
    await prisma.$queryRaw`delete from public.meal_forms where id = ${id}::uuid`
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("MEAL form delete error", e)
    return NextResponse.json({ success: false, error: "Failed to delete form" }, { status: 500 })
  }
}


