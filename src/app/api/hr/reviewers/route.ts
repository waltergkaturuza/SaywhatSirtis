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

    // Get all users who can conduct performance reviews
    const reviewers = await prisma.users.findMany({
      where: {
        OR: [
          { roles: { has: 'reviewer' } },
          { roles: { has: 'supervisor' } },
          { roles: { has: 'hr_manager' } },
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

    const reviewerData = reviewers.map(reviewer => ({
      id: reviewer.id,
      name: `${reviewer.firstName} ${reviewer.lastName}`,
      email: reviewer.email,
      department: reviewer.department || 'Unassigned',
      position: reviewer.position || 'Employee',
      subordinateCount: reviewer._count.supervisees,
      reviewCount: 0, // Will be calculated based on actual review assignments
      isHR: reviewer.roles?.includes('hr_manager') || reviewer.roles?.includes('ADMIN'),
      isSupervisor: reviewer.roles?.includes('supervisor')
    }))

    return NextResponse.json({
      reviewers: reviewerData,
      data: reviewerData,
      message: 'Reviewers retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching reviewers:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviewers',
        message: error instanceof Error ? error.message : 'Database connection failed'
      },
      { status: 500 }
    )
  }
}