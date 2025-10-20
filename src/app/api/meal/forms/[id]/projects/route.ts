import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const { id } = ctx.params?.then ? await ctx.params : ctx.params

    const projects = await prisma.$queryRaw<any[]>`
      select p.id, p.name, mfp.created_at as "assignedAt"
      from public.meal_form_projects mfp
      join public.projects p on mfp.project_id = p.id
      where mfp.form_id = ${id}::uuid
      order by mfp.created_at desc
    `
    return NextResponse.json({ success: true, data: projects })
  } catch (e) {
    console.error("MEAL form projects fetch error", e)
    return NextResponse.json({ success: false, error: "Failed to fetch form projects" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const roles: string[] = (session.user as any)?.roles || []
    const canEdit = roles.some(r => ["ADMIN","SUPER_ADMIN","SYSTEM_ADMINISTRATOR","ADVANCE_USER_2","HR","MEAL_ADMIN"].includes(r))
    if (!canEdit) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    const { id } = ctx.params?.then ? await ctx.params : ctx.params

    const { projectIds } = await req.json()
    if (!Array.isArray(projectIds)) return NextResponse.json({ success: false, error: "projectIds must be an array" }, { status: 400 })

    // Delete existing assignments
    await prisma.$queryRaw`
      delete from public.meal_form_projects where form_id = ${id}::uuid
    `

    // Insert new assignments
    if (projectIds.length > 0) {
      const values = projectIds.map((projectId: string) => `('${projectId}', '${id}')`).join(',')
      await prisma.$queryRaw`
        insert into public.meal_form_projects (project_id, form_id)
        values ${values}
      `
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("MEAL form projects update error", e)
    return NextResponse.json({ success: false, error: "Failed to update form projects" }, { status: 500 })
  }
}
