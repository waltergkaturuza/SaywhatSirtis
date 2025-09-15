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

    // Get all users who are supervisors or have supervisor role
    const supervisors = await prisma.users.findMany({
      where: {
        OR: [
          { roles: { has: 'supervisor' } },
          { role: 'ADMIN' },
          { 
            supervisees: {
              some: {}
            }
          }
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
        roles: true,
        _count: {
          select: {
            supervisees: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    const supervisorData = supervisors.map(supervisor => ({
      id: supervisor.id,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      email: supervisor.email,
      department: supervisor.department || 'Unassigned',
      position: supervisor.position || 'Employee',
      subordinateCount: supervisor._count.supervisees,
      isHR: supervisor.roles?.includes('hr') || supervisor.role === 'ADMIN'
    }))

    return NextResponse.json({
      supervisors: supervisorData,
      message: 'Supervisors retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
