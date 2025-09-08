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

    // Fetch employees who are supervisors or can be assigned as supervisors
    const supervisors = await (prisma.employee.findMany as any)({
      where: {
        status: 'ACTIVE',
        OR: [
          { isSupervisor: true },
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
        email: true,
        isSupervisor: true,
        isReviewer: true
      },
      orderBy: [
        { isSupervisor: 'desc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

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
