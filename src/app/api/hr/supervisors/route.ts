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
    const user = await prisma.users.findUnique({
      where: { email: session.user.email! }
    })

    if (!user || !['HR', 'ADMIN'].includes(user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get employees who can act as supervisors (managers and senior positions)
    const supervisors = await prisma.users.findMany({
      where: {
        OR: [
          { position: { contains: 'Manager' } },
          { position: { contains: 'Director' } },
          { position: { contains: 'Lead' } },
          { position: { contains: 'Supervisor' } },
          { position: { contains: 'Head' } },
          { department: 'HR' },
          { department: 'ADMIN' }
        ]
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    const supervisorData = supervisors.map(supervisor => ({
      id: supervisor.id,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      department: supervisor.department || 'Unassigned',
      position: supervisor.position || 'Employee'
    }))

    return NextResponse.json(supervisorData)
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
