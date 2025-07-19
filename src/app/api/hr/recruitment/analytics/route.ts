import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handlePrismaError,
  logError,
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'

// GET /api/hr/recruitment/analytics - Get recruitment analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30' // days
    const department = searchParams.get('department')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(timeframe))

    // Build where clause for filtering
    const jobsWhere: Record<string, unknown> = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
    const applicationsWhere: Record<string, unknown> = {
      appliedDate: {
        gte: startDate,
        lte: endDate
      }
    }

    if (department && department !== 'all') {
      jobsWhere.department = department
      applicationsWhere.job = {
        department: department
      }
    }

    // Fetch basic counts
    const [
      totalJobs,
      activeJobs,
      draftJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      reviewedApplications,
      interviewedApplications,
      rejectedApplications,
      hiredApplications
    ] = await Promise.all([
      prisma.jobPosting.count({ where: jobsWhere }),
      prisma.jobPosting.count({ 
        where: { ...jobsWhere, status: 'ACTIVE' }
      }),
      prisma.jobPosting.count({ 
        where: { ...jobsWhere, status: 'DRAFT' }
      }),
      prisma.jobPosting.count({ 
        where: { ...jobsWhere, status: 'CLOSED' }
      }),
      prisma.application.count({ where: applicationsWhere }),
      prisma.application.count({ 
        where: { ...applicationsWhere, status: 'SUBMITTED' }
      }),
      prisma.application.count({ 
        where: { ...applicationsWhere, status: 'REVIEWING' }
      }),
      prisma.application.count({ 
        where: { ...applicationsWhere, status: 'INTERVIEWED' }
      }),
      prisma.application.count({ 
        where: { ...applicationsWhere, status: 'REJECTED' }
      }),
      prisma.application.count({ 
        where: { ...applicationsWhere, status: 'HIRED' }
      })
    ])

    // Get applications by department
    const applicationsByDepartment = await prisma.application.groupBy({
      by: ['jobId'],
      where: applicationsWhere,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get job details for department grouping
    const jobIds = applicationsByDepartment.map(item => item.jobId)
    const jobs = await prisma.jobPosting.findMany({
      where: { id: { in: jobIds } },
      select: { id: true, department: true }
    })

    const jobDepartmentMap = Object.fromEntries(
      jobs.map(job => [job.id, job.department])
    )

    // Group applications by department
    const departmentStats = applicationsByDepartment.reduce((acc, item) => {
      const dept = jobDepartmentMap[item.jobId] || 'Unknown'
      if (!acc[dept]) {
        acc[dept] = { name: dept, applications: 0 }
      }
      acc[dept].applications += item._count.id
      return acc
    }, {} as Record<string, { name: string; applications: number }>)

    // Get top performing jobs (by application count)
    const topJobs = await prisma.jobPosting.findMany({
      where: jobsWhere,
      include: {
        applications: {
          where: {
            appliedDate: {
              gte: startDate,
              lte: endDate
            }
          },
          select: { id: true }
        }
      },
      orderBy: {
        applications: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Get time series data for applications (last 30 days)
    const applicationTimeSeries = await prisma.application.groupBy({
      by: ['appliedDate'],
      where: {
        appliedDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: new Date()
        },
        ...(department && department !== 'all' ? {
          job: {
            department: department
          }
        } : {})
      },
      _count: {
        id: true
      },
      orderBy: {
        appliedDate: 'asc'
      }
    })

    // Transform time series data to daily counts
    const dailyApplications = applicationTimeSeries.reduce((acc, item) => {
      const date = item.appliedDate.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + item._count.id
      return acc
    }, {} as Record<string, number>)

    // Calculate metrics
    const applicationRate = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : '0'
    const hireRate = totalApplications > 0 ? ((hiredApplications / totalApplications) * 100).toFixed(1) : '0'
    const rejectRate = totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(1) : '0'

    const analytics = {
      overview: {
        totalJobs,
        activeJobs,
        draftJobs,
        closedJobs,
        totalApplications,
        pendingApplications,
        reviewedApplications,
        interviewedApplications,
        rejectedApplications,
        hiredApplications,
        applicationRate: parseFloat(applicationRate),
        hireRate: parseFloat(hireRate),
        rejectRate: parseFloat(rejectRate)
      },
      departmentStats: Object.values(departmentStats),
      topJobs: topJobs.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        applications: (job as any).applications?.length || 0,
        status: job.status.toLowerCase().replace('_', '-')
      })),
      timeSeriesData: {
        daily: dailyApplications,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: parseInt(timeframe)
        }
      },
      statusDistribution: {
        pending: pendingApplications,
        reviewed: reviewedApplications,
        interviewed: interviewedApplications,
        rejected: rejectedApplications,
        hired: hiredApplications
      }
    }

    const response = createSuccessResponse(analytics, {
      message: 'Recruitment analytics retrieved successfully'
    })

    return NextResponse.json(response)
  } catch (error) {
    logError(error, {
      endpoint: '/api/hr/recruitment/analytics',
      userId: 'unknown'
    })

    const { response, status } = handlePrismaError(error)
    return NextResponse.json(response, { status })
  }
}
