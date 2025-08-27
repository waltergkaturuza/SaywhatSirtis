import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Authentication required", 
        message: "Please log in to view dashboard metrics. Go to /auth/signin to sign in.",
        code: "UNAUTHORIZED",
        redirectUrl: "/auth/signin"
      }, { status: 401 })
    }

    // Get current date for calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    // Fetch all projects with counts
    try {
      // Add connection check and retry logic
      await prisma.$connect()
      
      const [
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        activities,
        recentProjects,
        budgetInfo
      ] = await Promise.all([
        // Total projects count
        prisma.project.count().catch(() => 0),
        
        // Active projects count
        prisma.project.count({
          where: { status: 'ACTIVE' }
        }).catch(() => 0),
        
        // Completed projects count
        prisma.project.count({
          where: { status: 'COMPLETED' }
        }).catch(() => 0),
        
        // On-hold projects count
        prisma.project.count({
          where: { status: 'ON_HOLD' }
        }).catch(() => 0),

        // Recent activities
        prisma.activity.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            project: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }).catch(() => []),

        // Recent projects for the dashboard cards
        prisma.project.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }).catch(() => []),

        // Budget information
        prisma.project.aggregate({
          _sum: {
            budget: true,
            actualSpent: true
          },
          _count: {
            id: true
          }
        }).catch(() => ({ _sum: { budget: 0, actualSpent: 0 }, _count: { id: 0 } }))
      ])

      // Calculate metrics
      const totalBudget = budgetInfo._sum.budget || 0
      const totalSpent = budgetInfo._sum.actualSpent || 0
      const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

      // Calculate overdue projects (projects past end date with non-completed status)
      const overdueProjects = await prisma.project.count({
        where: {
          endDate: {
            lt: now
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      })

      // Calculate high risk projects (assuming projects with high spending ratio or overdue)
      const highRiskProjects = await prisma.project.count({
        where: {
          OR: [
            {
              endDate: {
                lt: now
              },
              status: {
                notIn: ['COMPLETED', 'CANCELLED']
              }
            },
            // Add more risk criteria as needed
          ]
        }
      })

      // Calculate average progress (this would need a progress field in your schema)
      // For now, we'll calculate based on time elapsed vs total time
      const projectsWithDates = await prisma.project.findMany({
        select: {
          startDate: true,
          endDate: true,
          status: true
        },
        where: {
          startDate: { not: null },
          endDate: { not: null }
        }
      })

      let totalProgress = 0
      let projectCount = 0
      
      projectsWithDates.forEach(project => {
        if (project.startDate && project.endDate) {
          const totalDuration = project.endDate.getTime() - project.startDate.getTime()
          const elapsedDuration = Math.min(now.getTime() - project.startDate.getTime(), totalDuration)
          const timeProgress = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100))
          
          if (project.status === 'COMPLETED') {
            totalProgress += 100
          } else {
            totalProgress += timeProgress
          }
          projectCount++
        }
      })

      const averageProgress = projectCount > 0 ? Math.round(totalProgress / projectCount) : 0

      // For now, set upcoming milestones to 0 since we don't have milestone/activity tables yet
      // In the future, you can implement milestone tracking:
      // const upcomingMilestones = await prisma.milestone.count({...})
      const upcomingMilestones = 0

      // Format recent projects for dashboard
      const recentProjectsFormatted = recentProjects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status?.toLowerCase() || 'planning',
        progress: averageProgress, // You might want to store actual progress per project
        dueDate: project.endDate?.toISOString() || '',
        manager: project.creator ? `${project.creator.firstName || ''} ${project.creator.lastName || ''}`.trim() || 'Unassigned' : 'Unassigned',
        priority: 'medium', // You might want to add this field to your schema
        budget: project.budget || 0,
        spent: project.actualSpent || 0
      }))

      const metrics = {
        totalProjects: totalProjects,  // Fixed variable name
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalBudget,
        totalSpent,
        budgetUtilization,
        averageProgress,
        overdueProjects,
        upcomingMilestones,
        highRiskProjects,
        resourceUtilization: 85, // This would need actual resource tracking
        deliverySuccess: Math.round((completedProjects / Math.max(totalProjects, 1)) * 100)  // Fixed variable name
      }

      return NextResponse.json({ 
        success: true,
        data: {
          metrics,
          recentProjects: recentProjectsFormatted
        }
      })

    } catch (dbError) {
      console.error('Database error in dashboard:', dbError)
      throw dbError
    }

  } catch (error) {
    console.error('Dashboard metrics fetch error:', error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch dashboard metrics",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 })
  }
}
