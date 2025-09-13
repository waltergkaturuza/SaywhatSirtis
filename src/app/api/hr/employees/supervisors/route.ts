import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager') ||
                         session.user?.roles?.includes('hr_staff')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch users who are supervisors or can be assigned as supervisors
    const potentialSupervisors = await prisma.users.findMany({
      where: {
        isActive: true,
        OR: [
          { 
            position: {
              contains: 'manager',
              mode: 'insensitive'
            }
          },
          {
            position: {
              contains: 'supervisor',
              mode: 'insensitive'
            }
          },
          {
            position: {
              contains: 'director',
              mode: 'insensitive'
            }
          },
          {
            position: {
              contains: 'lead',
              mode: 'insensitive'
            }
          },
          {
            position: {
              contains: 'head',
              mode: 'insensitive'
            }
          },
          {
            position: {
              contains: 'lead',
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        email: true
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Get corresponding employee records to check supervisor status
    const employeeRecords = await prisma.employees.findMany({
      where: {
        userId: { in: potentialSupervisors.map(u => u.id) }
      },
      select: {
        userId: true,
        is_supervisor: true,
        is_reviewer: true
      }
    })

    const employeeMap = new Map(employeeRecords.map(emp => [emp.userId, emp]))

    // Merge the data
    const supervisors = potentialSupervisors.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      department: user.department,
      email: user.email,
      isSupervisor: employeeMap.get(user.id)?.is_supervisor || false,
      isReviewer: employeeMap.get(user.id)?.is_reviewer || false
    }))

    return NextResponse.json({
      success: true,
      data: supervisors
    })

  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
