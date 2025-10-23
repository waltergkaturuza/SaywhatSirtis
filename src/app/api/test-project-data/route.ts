import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get all projects to see what's available
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get the resultsFramework using raw query since it's not in the Prisma schema
    const projectsWithFramework = await Promise.all(projects.map(async (project) => {
      try {
        const frameworkResult = await prisma.$queryRaw<any[]>`
          SELECT "resultsFramework" FROM projects WHERE id = ${project.id}
        `
        return {
          ...project,
          resultsFramework: frameworkResult[0]?.resultsFramework || null
        }
      } catch (error) {
        return {
          ...project,
          resultsFramework: null
        }
      }
    }))

    // Check specifically for Community Water Program
    const communityWaterProject = projectsWithFramework.find(p => 
      p.name.toLowerCase().includes('community') && 
      p.name.toLowerCase().includes('water')
    )

    // Check if any project has a resultsFramework
    const projectsWithFrameworkData = projectsWithFramework.filter(p => 
      p.resultsFramework && 
      p.resultsFramework !== null && 
      p.resultsFramework !== '{}'
    )

    return NextResponse.json({
      success: true,
      message: "Project data retrieved successfully",
      data: {
        totalProjects: projectsWithFramework.length,
        projectsWithFramework: projectsWithFrameworkData.length,
        communityWaterProject: communityWaterProject || null,
        allProjects: projectsWithFramework.map(p => ({
          id: p.id,
          name: p.name,
          hasResultsFramework: p.resultsFramework ? true : false,
          resultsFrameworkType: typeof p.resultsFramework,
          resultsFrameworkValue: p.resultsFramework
        }))
      }
    })
  } catch (error) {
    console.error("Error fetching project data:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch project data", 
      details: (error as Error).message 
    }, { status: 500 })
  }
}
