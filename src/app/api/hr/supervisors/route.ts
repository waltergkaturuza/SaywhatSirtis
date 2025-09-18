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

    // Get all users who are supervisors or have supervisor role
    const supervisors = await executeQuery(async (prisma) =>
      prisma.users.findMany({
        where: {
          OR: [
            { roles: { has: 'supervisor' } },
            { role: 'ADMIN' }
          ],
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          position: true,
          roles: true
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
      department: supervisor.department || 'Unassigned',
      position: supervisor.position || 'Employee',
      subordinateCount: 0, // TODO: Implement count query
      isHR: supervisor.roles?.includes('hr') || supervisor.roles?.includes('ADMIN')
    }))

    return NextResponse.json({
      supervisors: supervisorData,
      message: 'Supervisors retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch supervisors',
        message: error instanceof Error ? error.message : 'Database connection failed'
      },
      { status: 500 }
    )
  }
}
