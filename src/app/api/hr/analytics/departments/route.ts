import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '12months'

    // Calculate date range based on period
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

    // Get department statistics
    const departments = await prisma.user.groupBy({
      by: ['department'],
      where: {
        isActive: true
      },
      _count: {
        id: true
      }
    })

    // Get performance data by department
    const performanceByDept = await prisma.appraisal.groupBy({
      by: ['employeeId'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    // Mock department data with realistic values
    const departmentData = [
      {
        department: 'Technology',
        employees: 45,
        avgSalary: 78000,
        turnoverRate: 8.2,
        performanceScore: 4.3,
        satisfactionScore: 4.1,
        percentage: 15
      },
      {
        department: 'Human Resources', 
        employees: 28,
        avgSalary: 62000,
        turnoverRate: 12.5,
        performanceScore: 4.1,
        satisfactionScore: 4.0,
        percentage: 9
      },
      {
        department: 'Programs',
        employees: 85,
        avgSalary: 55000,
        turnoverRate: 15.3,
        performanceScore: 4.0,
        satisfactionScore: 3.9,
        percentage: 28
      },
      {
        department: 'Call Centre',
        employees: 52,
        avgSalary: 42000,
        turnoverRate: 22.1,
        performanceScore: 3.8,
        satisfactionScore: 3.7,
        percentage: 17
      },
      {
        department: 'Analytics',
        employees: 35,
        avgSalary: 72000,
        turnoverRate: 9.8,
        performanceScore: 4.2,
        satisfactionScore: 4.2,
        percentage: 12
      },
      {
        department: 'Finance',
        employees: 22,
        avgSalary: 68000,
        turnoverRate: 7.5,
        performanceScore: 4.1,
        satisfactionScore: 4.0,
        percentage: 7
      },
      {
        department: 'Operations',
        employees: 38,
        avgSalary: 58000,
        turnoverRate: 18.7,
        performanceScore: 3.9,
        satisfactionScore: 3.8,
        percentage: 12
      }
    ]

    return NextResponse.json(departmentData)
  } catch (error) {
    console.error('Error fetching department analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department analytics' },
      { status: 500 }
    )
  }
}
