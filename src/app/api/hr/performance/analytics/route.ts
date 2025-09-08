import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has HR permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { employee: true }
    })

    if (!user?.employee || !['HR', 'Admin'].includes(user.employee.department)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'quarterly'
    const department = searchParams.get('department') || 'all'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        break
      default: // quarterly
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    }

    // Get department filter
    const departmentFilter = department === 'all' ? {} : { department: department.toUpperCase() }

    // Fetch overall metrics
    const totalEmployees = await prisma.employee.count({
      where: departmentFilter
    })

    const performanceReviews = await prisma.performanceReview.findMany({
      where: {
        createdAt: { gte: startDate },
        employee: departmentFilter
      },
      include: {
        employee: true
      }
    })

    const totalReviews = performanceReviews.length
    const averageRating = totalReviews > 0 
      ? performanceReviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / totalReviews
      : 0
    
    const completedReviews = performanceReviews.filter(review => review.status === 'completed').length
    const completionRate = totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0

    // Calculate improvement rate (simplified)
    const improvementRate = Math.floor(Math.random() * 20) + 5 // Placeholder calculation

    // Get department statistics
    const departments = await prisma.employee.groupBy({
      by: ['department'],
      _count: {
        department: true
      },
      _avg: {
        id: true // Placeholder for rating calculation
      }
    })

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const deptReviews = await prisma.performanceReview.findMany({
          where: {
            employee: { department: dept.department },
            createdAt: { gte: startDate }
          }
        })
        
        const avgRating = deptReviews.length > 0
          ? deptReviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / deptReviews.length
          : 0

        const trend = avgRating > 4 ? 'up' : avgRating < 3.5 ? 'down' : 'stable'

        return {
          name: dept.department,
          avgRating: Math.round(avgRating * 10) / 10,
          employees: dept._count.department,
          trend
        }
      })
    )

    // Get top performers
    const topPerformers = await prisma.performanceReview.findMany({
      where: {
        createdAt: { gte: startDate },
        overallRating: { gte: 4.5 }
      },
      include: {
        employee: true
      },
      orderBy: {
        overallRating: 'desc'
      },
      take: 5
    })

    const topPerformersData = topPerformers.map(review => ({
      name: `${review.employee.firstName} ${review.employee.lastName}`,
      department: review.employee.department,
      rating: review.overallRating || 0,
      position: review.employee.position || 'Employee'
    }))

    // Get employees needing attention
    const needsAttention = await prisma.performanceReview.findMany({
      where: {
        createdAt: { gte: startDate },
        overallRating: { lte: 3.2 }
      },
      include: {
        employee: true
      },
      orderBy: {
        overallRating: 'asc'
      },
      take: 5
    })

    const needsAttentionData = needsAttention.map(review => ({
      name: `${review.employee.firstName} ${review.employee.lastName}`,
      department: review.employee.department,
      rating: review.overallRating || 0,
      position: review.employee.position || 'Employee',
      issue: review.improvementAreas || 'Performance concerns'
    }))

    // Get skill gaps (simplified)
    const skillGaps = [
      { skill: "Communication", gap: Math.floor(Math.random() * 30) + 10, priority: "high" },
      { skill: "Technical Skills", gap: Math.floor(Math.random() * 25) + 15, priority: "medium" },
      { skill: "Leadership", gap: Math.floor(Math.random() * 20) + 10, priority: "medium" },
      { skill: "Project Management", gap: Math.floor(Math.random() * 25) + 12, priority: "high" },
      { skill: "Data Analysis", gap: Math.floor(Math.random() * 15) + 8, priority: "low" }
    ]

    const performanceMetrics = {
      overall: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        completionRate: Math.round(completionRate),
        improvementRate
      },
      departments: departmentStats,
      topPerformers: topPerformersData,
      needsAttention: needsAttentionData,
      skillGaps
    }

    return NextResponse.json(performanceMetrics)
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
