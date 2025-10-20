import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    // First, let's get the basic forms data
    const forms = await prisma.$queryRaw<any[]>`
      select 
        f.id, f.name, f.description, f.project_id as "projectId", f.version,
        f.language, f.status, f.created_by as "createdBy", f.updated_by as "updatedBy",
        f.published_at as "publishedAt", f.schema, f.created_at as "createdAt", f.updated_at as "updatedAt"
      from public.meal_forms f
      order by f.created_at desc
    `
    
    // Now let's get the project and user data separately
    for (let form of forms) {
      // Get project name for the main project_id
      if (form.projectId) {
        console.log("Looking up project with ID:", form.projectId)
        const project = await prisma.$queryRaw<any[]>`
          select name from public.projects where id = ${form.projectId}
        `
        console.log("Project lookup result:", project[0])
        form.projectName = project[0]?.name || null
      }
      
      // Get assigned projects from junction table
      console.log("Looking up assigned projects for form:", form.id)
      const assignedProjects = await prisma.$queryRaw<any[]>`
        select p.name from public.meal_form_projects mfp
        join public.projects p on mfp.project_id = p.id
        where mfp.form_id = ${form.id}::uuid
      `
      console.log("Assigned projects result:", assignedProjects)
      form.assignedProjects = assignedProjects.map(p => p.name)
      
      // Get creator info - try multiple approaches
      if (form.createdBy) {
        console.log("Looking up creator with ID:", form.createdBy)
        
        // Try with user ID first
        let creator = await prisma.$queryRaw<any[]>`
          select "firstName", "lastName", "employeeId" from public.users where id = ${form.createdBy}::text
        `
        
        // If not found, try with employee ID
        if (!creator[0]) {
          creator = await prisma.$queryRaw<any[]>`
            select "firstName", "lastName", "employeeId" from public.users where "employeeId" = ${form.createdBy}::text
          `
        }
        
        // If still not found, try with email
        if (!creator[0]) {
          creator = await prisma.$queryRaw<any[]>`
            select "firstName", "lastName", "employeeId" from public.users where email = ${form.createdBy}::text
          `
        }
        
        console.log("Creator lookup result:", creator[0])
        if (creator[0]) {
          form.createdByFirstName = creator[0].firstName
          form.createdByLastName = creator[0].lastName
        } else {
          // If still not found, show the ID as fallback
          form.createdByFirstName = `ID: ${form.createdBy}`
          form.createdByLastName = ""
        }
      }
      
      // Get updater info - try multiple approaches
      if (form.updatedBy) {
        console.log("Looking up updater with ID:", form.updatedBy)
        
        // Try with user ID first
        let updater = await prisma.$queryRaw<any[]>`
          select "firstName", "lastName", "employeeId" from public.users where id = ${form.updatedBy}::text
        `
        
        // If not found, try with employee ID
        if (!updater[0]) {
          updater = await prisma.$queryRaw<any[]>`
            select "firstName", "lastName", "employeeId" from public.users where "employeeId" = ${form.updatedBy}::text
          `
        }
        
        // If still not found, try with email
        if (!updater[0]) {
          updater = await prisma.$queryRaw<any[]>`
            select "firstName", "lastName", "employeeId" from public.users where email = ${form.updatedBy}::text
          `
        }
        
        console.log("Updater lookup result:", updater[0])
        if (updater[0]) {
          form.updatedByFirstName = updater[0].firstName
          form.updatedByLastName = updater[0].lastName
        } else {
          // If still not found, show the ID as fallback
          form.updatedByFirstName = `ID: ${form.updatedBy}`
          form.updatedByLastName = ""
        }
      }
    }
    console.log("MEAL forms data:", forms.map(f => ({ 
      name: f.name, 
      projectName: f.projectName, 
      assignedProjects: f.assignedProjects,
      projectId: f.projectId,
      createdBy: f.createdBy,
      createdByFirstName: f.createdByFirstName,
      createdByLastName: f.createdByLastName,
      updatedBy: f.updatedBy,
      updatedByFirstName: f.updatedByFirstName,
      updatedByLastName: f.updatedByLastName
    })))
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
    
    // Get the actual user ID from the session
    const userId = session.user.id
    console.log("Creating form with user ID:", userId, "Session user:", session.user)
    
    // Also get user info to verify
    const userInfo = await prisma.$queryRaw<any[]>`
      select id, "firstName", "lastName", "employeeId", email from public.users where id = ${userId}::text
    `
    console.log("User info for form creation:", userInfo[0])
    
    // If user not found by ID, try by email
    let actualUserId = userId
    if (!userInfo[0]) {
      const userByEmail = await prisma.$queryRaw<any[]>`
        select id, "firstName", "lastName", "employeeId", email from public.users where email = ${session.user.email}::text
      `
      console.log("User lookup by email:", userByEmail[0])
      if (userByEmail[0]) {
        actualUserId = userByEmail[0].id
      }
    }
    
    const created = await prisma.$queryRaw<any[]>`
      insert into public.meal_forms
        (name, description, project_id, language, status, created_by, schema)
      values
        (${body.name}, ${body.description ?? null}, ${body.project_id ?? null},
         ${body.language ?? 'en'}, ${body.status ?? 'draft'},
         ${actualUserId}::uuid, ${JSON.stringify(body.schema || {})}::jsonb)
      returning *
    `
    
    const form = created?.[0]
    console.log("Created form:", form)
    console.log("Project IDs to assign:", body.projectIds)
    
    if (form && body.projectIds && Array.isArray(body.projectIds) && body.projectIds.length > 0) {
      // First, check if projects exist
      const existingProjects = await prisma.$queryRaw<any[]>`
        select id, name from public.projects where id = ANY(${body.projectIds})
      `
      console.log("Existing projects found:", existingProjects)
      
      // Assign form to multiple projects
      for (const projectId of body.projectIds) {
        console.log("Assigning project", projectId, "to form", form.id)
        try {
          await prisma.$queryRaw`
            insert into public.meal_form_projects (project_id, form_id)
            values (${projectId}, ${form.id}::uuid)
            on conflict (form_id, project_id) do nothing
          `
          console.log("Successfully assigned project", projectId)
        } catch (error) {
          console.error("Error assigning project", projectId, ":", error)
        }
      }
    }
    
    return NextResponse.json({ success: true, data: form })
  } catch (e) {
    console.error("MEAL form create error", e)
    return NextResponse.json({ success: false, error: "Failed to create form" }, { status: 500 })
  }
}


