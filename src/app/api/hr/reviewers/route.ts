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

    // Get all employees who are marked as reviewers
    const reviewers = await executeQuery(async (prisma) =>
      prisma.employees.findMany({
        where: {
          is_reviewer: true,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          position: true,
          is_supervisor: true,
          departments: {
            select: {
              name: true
            }
          }
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      })
    )

    const reviewerData = reviewers.map(reviewer => ({
      id: reviewer.id,
      name: `${reviewer.firstName} ${reviewer.lastName}`,
      email: reviewer.email,
      department: reviewer.departments?.name || reviewer.department || 'Unassigned',
      position: reviewer.position || 'Reviewer',
      reviewCount: 0, // TODO: Implement review count query
      isHR: reviewer.department?.toLowerCase().includes('hr') || reviewer.department?.toLowerCase().includes('human resources'),
      isSupervisor: reviewer.is_supervisor || false
    }))

    return NextResponse.json({
      success: true,
      reviewers: reviewerData,
      data: reviewerData,
      message: 'Reviewers retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching reviewers:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reviewers',
        message: error instanceof Error ? error.message : 'Database connection failed'
      },
      { status: 500 }
    )
  }
}
