import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log('Testing dashboard data fetch...')
    
    // Get current date for calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    // Check if database has data
    const projectCount = await prisma.projects.count()
    
    if (projectCount === 0) {
      // Return empty data for empty database
      return NextResponse.json({
        success: true,
        data: {
          metrics: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            onHoldProjects: 0,
            totalBudget: 0,
            spentBudget: 0,
            budgetUtilization: 0,
            avgProjectDuration: 0
          },
          recentProjects: []
        },
        message: "Dashboard data fetched successfully (empty database)",
        timestamp: new Date().toISOString()
      })
    }

    // Fetch all projects with counts
    const [
      allProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      recentProjects,
      budgetInfo
    ] = await Promise.all([
      // Total projects count
      prisma.projects.count(),
      
      // Active projects count
      prisma.projects.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Completed projects count
      prisma.projects.count({
        where: { status: 'COMPLETED' }
      }),
      
      // On-hold projects count
      prisma.projects.count({
        where: { status: 'ON_HOLD' }
      }),

      // Recent projects for the dashboard cards
      prisma.projects.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          users_projects_creatorIdTousers: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),

      // Budget calculations
      prisma.projects.aggregate({
        _sum: {
          budget: true,
          actualSpent: true
        }
      })
    ])

    // Calculate metrics
    const totalBudget = budgetInfo._sum?.budget || 0
    const spentBudget = budgetInfo._sum?.actualSpent || 0
    const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0

    // Calculate average project duration (mock calculation)
    const avgProjectDuration = Math.round(Math.random() * 120 + 30) // 30-150 days

    const dashboardData = {
      metrics: {
        totalProjects: allProjects,
        activeProjects: activeProjects,
        completedProjects: completedProjects,
        onHoldProjects: onHoldProjects,
        totalBudget: totalBudget,
        spentBudget: spentBudget,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100,
        avgProjectDuration: avgProjectDuration
      },
      recentProjects: recentProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        priority: project.priority,
        progress: project.progress || 0,
        dueDate: project.endDate,
        manager: project.users_projects_creatorIdTousers ? `${project.users_projects_creatorIdTousers.firstName || ''} ${project.users_projects_creatorIdTousers.lastName || ''}`.trim() || 'Unassigned' : 'Unassigned',
        budget: project.budget || 0
      }))
    }

    console.log('Dashboard data fetched successfully:', {
      totalProjects: allProjects,
      activeProjects,
      completedProjects,
      recentProjectsCount: recentProjects.length
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: "Dashboard data fetched successfully",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard test error:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch dashboard data",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
