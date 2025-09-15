import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'
    const department = searchParams.get('department') || 'all'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case '24months':
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), 1)
        break
      default: // 12months
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    }

    // Build where clause for department filtering
    let whereClause: any = {
      createdAt: {
        gte: startDate
      }
    }

    if (department !== 'all') {
      // Get employees from specific department
      const deptEmployees = await prisma.employees.findMany({
        where: {
          departments: {
            OR: [
              { name: { contains: department, mode: 'insensitive' } },
              { code: { contains: department, mode: 'insensitive' } }
            ]
          }
        },
        select: { id: true }
      })

      whereClause.employeeId = {
        in: deptEmployees.map(e => e.id)
      }
    }

    // Get real performance distribution from database
    const performanceReviews = await prisma.performance_reviews.findMany({
      where: whereClause,
      select: {
        overallRating: true
      }
    })

    // Categorize performance ratings
    const excellent = performanceReviews.filter(p => p.overallRating !== null && p.overallRating! >= 4.5).length
    const satisfactory = performanceReviews.filter(p => p.overallRating !== null && p.overallRating! >= 3.5 && p.overallRating! < 4.5).length
    const needsImprovement = performanceReviews.filter(p => p.overallRating !== null && p.overallRating! >= 2.0 && p.overallRating! < 3.5).length
    const unsatisfactory = performanceReviews.filter(p => p.overallRating !== null && p.overallRating! < 2.0).length
    
    const total = performanceReviews.length || 1 // Avoid division by zero

    const performanceData = [
      { 
        rating: 'Excellent', 
        count: excellent, 
        percentage: Math.round((excellent / total) * 1000) / 10 
      },
      { 
        rating: 'Satisfactory', 
        count: satisfactory, 
        percentage: Math.round((satisfactory / total) * 1000) / 10 
      },
      { 
        rating: 'Needs Improvement', 
        count: needsImprovement, 
        percentage: Math.round((needsImprovement / total) * 1000) / 10 
      },
      { 
        rating: 'Unsatisfactory', 
        count: unsatisfactory, 
        percentage: Math.round((unsatisfactory / total) * 1000) / 10 
      }
    ]

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    )
  }
}
