import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all employees who are marked as supervisors
    const supervisors = await executeQuery(async (prisma) =>
      prisma.employees.findMany({
        where: {
          is_supervisor: true,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          position: true,
          departments: {
            select: {
              name: true
            }
          },
          other_employees: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true
            }
          }
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      })
    )

    const supervisorData = supervisors.map(supervisor => ({
      id: supervisor.id,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      email: supervisor.email,
      department: supervisor.departments?.name || supervisor.department || 'Unassigned',
      position: supervisor.position || 'Supervisor',
      subordinateCount: supervisor.other_employees?.length || 0
    }))

    return NextResponse.json({
      success: true,
      supervisors: supervisorData,
      data: supervisorData,
      message: 'Supervisors retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch supervisors',
        message: error instanceof Error ? error.message : 'Database connection failed'
      },
      { status: 500 }
    )
  }
}
