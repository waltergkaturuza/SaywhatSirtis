import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildProjectIdToIndicatorProgress } from "@/lib/programs/indicator-progress"
import { aggregateResultsFrameworkProgress, resolveProjectResultsFramework } from "@/lib/programs/results-framework-progress"
import { fetchMealIndicatorsForProjectProgress } from "@/lib/programs/meal-indicators-query"

function periodConfig(range: string | null): { start: Date; label: string; key: string } {
  const now = new Date()
  const presets: Record<string, { days: number; label: string }> = {
    week: { days: 7, label: "Last 7 days" },
    month: { days: 30, label: "Last 30 days" },
    quarter: { days: 90, label: "Last 90 days" },
    year: { days: 365, label: "Last 365 days" },
  }
  const p = presets[range || "month"] || presets.month
  const start = new Date(now.getTime() - p.days * 86400000)
  return { start, label: p.label, key: range && presets[range] ? range : "month" }
}

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

    const rangeParam = request.nextUrl.searchParams.get("range")
    const { start: periodStart, label: periodLabel, key: periodKey } = periodConfig(rangeParam)

    // Get current date for calculations
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Fetch all projects with counts
    try {
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

        // Recent activities
        prisma.activities.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            projects: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }),

        // Recent projects: only those updated in the selected rolling period
        prisma.projects.findMany({
          where: { updatedAt: { gte: periodStart } },
          take: 6,
          orderBy: { updatedAt: 'desc' },
          include: {
            users_projects_managerIdTousers: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }),

        // Budget information
        prisma.projects.aggregate({
          _sum: {
            budget: true,
            actualSpent: true
          },
          _count: {
            id: true
          }
        })
      ])

      // Calculate metrics
      const totalBudget = budgetInfo._sum.budget || 0
      const totalSpent = budgetInfo._sum.actualSpent || 0
      const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

      // Calculate overdue projects (projects past end date with non-completed status)
      const overdueProjects = await prisma.projects.count({
        where: {
          AND: [
            {
              endDate: {
                lt: now
              }
            },
            {
              status: {
                notIn: ['COMPLETED', 'CANCELLED']
              }
            }
          ]
        }
      })

      // Calculate high risk projects (assuming projects with high spending ratio or overdue)
      const highRiskProjects = await prisma.projects.count({
        where: {
          OR: [
            {
              AND: [
                {
                  endDate: {
                    lt: now
                  }
                },
                {
                  status: {
                    notIn: ['COMPLETED', 'CANCELLED']
                  }
                }
              ]
            }
            // Add more risk criteria as needed
          ]
        }
      })

      const allProjectsForProgress = await prisma.projects.findMany({
        select: {
          id: true,
          progress: true,
          resultsFramework: true,
          objectives: true,
        },
      })
      const ids = allProjectsForProgress.map((p) => p.id)
      const dashboardIndicators = await fetchMealIndicatorsForProjectProgress(prisma, ids)
      const dashboardProgressByProject = buildProjectIdToIndicatorProgress(dashboardIndicators)

      const perProjectProgress: number[] = []
      for (const p of allProjectsForProgress) {
        const fwAgg = aggregateResultsFrameworkProgress(resolveProjectResultsFramework(p))
        const mealAgg = dashboardProgressByProject.get(p.id)
        const pct =
          fwAgg.hasData
            ? fwAgg.percent
            : mealAgg?.hasData
              ? mealAgg.percent
              : Math.round(p.progress ?? 0)
        perProjectProgress.push(pct)
      }
      const averageProgress =
        perProjectProgress.length > 0
          ? Math.round(
              perProjectProgress.reduce((a, b) => a + b, 0) / perProjectProgress.length
            )
          : 0

      const upcomingMilestones = await prisma.activities.count({
        where: {
          dueDate: { gte: now, lte: thirtyDaysFromNow },
          completedAt: null,
        },
      })

      const projectsUpdatedInPeriod = await prisma.projects.count({
        where: { updatedAt: { gte: periodStart } },
      })

      // Format recent projects for dashboard
      const recentProjectsFormatted = recentProjects.map((project) => {
        const row = {
          id: project.id,
          resultsFramework: project.resultsFramework,
          objectives: project.objectives,
          progress: project.progress,
        }
        const fwAgg = aggregateResultsFrameworkProgress(resolveProjectResultsFramework(row))
        const mealAgg = dashboardProgressByProject.get(project.id)
        const rowProgress = fwAgg.hasData
          ? fwAgg.percent
          : mealAgg?.hasData
            ? mealAgg!.percent
            : project.progress ?? 0
        return {
        id: project.id,
        name: project.name,
        status: project.status?.toLowerCase() || 'planning',
        progress: rowProgress,
        dueDate: project.endDate?.toISOString() || '',
        lead: project.users_projects_managerIdTousers ? `${project.users_projects_managerIdTousers.firstName || ''} ${project.users_projects_managerIdTousers.lastName || ''}`.trim() || 'Unassigned' : 'Unassigned',
        priority: project.priority?.toLowerCase() || 'medium', // Use actual project priority from database
        budget: project.budget || 0,
        spent: project.actualSpent || 0
      }
      })

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
        /** null = not tracked in-app (avoid fake percentages) */
        resourceUtilization: null as number | null,
        deliverySuccess: Math.round((completedProjects / Math.max(totalProjects, 1)) * 100),
      }

      return NextResponse.json({ 
        success: true,
        data: {
          metrics,
          recentProjects: recentProjectsFormatted,
          meta: {
            period: periodKey,
            periodLabel,
            periodStart: periodStart.toISOString(),
            projectsUpdatedInPeriod,
          },
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
