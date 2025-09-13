import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get HR statistics
    const totalEmployees = await prisma.employees.count()
    
    const activeEmployees = await prisma.employees.count({
      where: {
        status: 'ACTIVE'
      }
    })

    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)
    
    const newEmployeesThisMonth = await prisma.employees.count({
      where: {
        createdAt: {
          gte: thisMonthStart
        }
      }
    })

    // Count departments
    const departments = await prisma.employees.groupBy({
      by: ['department'],
      _count: {
        department: true
      }
    })

    // Training statistics (using Event model with type "training")
    const totalTrainings = await prisma.events.count({
      where: {
        type: 'training'
      }
    })
    
    const activeTrainings = await prisma.events.count({
      where: {
        type: 'training',
        status: {
          in: ['approved', 'in-progress']
        }
      }
    })

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      newEmployeesThisMonth,
      departmentCount: departments.length,
      departments: departments.map(d => ({
        name: d.department || 'Unknown',
        count: d._count.department
      })),
      totalTrainings,
      activeTrainings
    })

  } catch (error) {
    console.error('Error fetching HR stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not implemented' },
    { status: 501 }
  )
}
