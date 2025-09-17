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
          { role: 'ADMIN' },
          { 
            canReview: true 
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
            supervisees: true,
            reviewsAssigned: true
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
      reviewCount: reviewer._count.reviewsAssigned || 0,
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
    
    // Fallback data when database is not available
    const fallbackReviewers = [
      {
        id: 'rev-001',
        name: 'John Mukamuri',
        email: 'j.mukamuri@saywhat.org',
        department: 'Human Resources',
        position: 'HR Director',
        subordinateCount: 5,
        reviewCount: 12,
        isHR: true,
        isSupervisor: true
      },
      {
        id: 'rev-002', 
        name: 'Grace Nyamayaro',
        email: 'g.nyamayaro@saywhat.org',
        department: 'Information Technology',
        position: 'IT Manager',
        subordinateCount: 4,
        reviewCount: 8,
        isHR: false,
        isSupervisor: true
      },
      {
        id: 'rev-003',
        name: 'Tendai Moyo',
        email: 't.moyo@saywhat.org',
        department: 'Finance',
        position: 'Finance Manager',
        subordinateCount: 3,
        reviewCount: 6,
        isHR: false,
        isSupervisor: true
      },
      {
        id: 'rev-004',
        name: 'Chipo Zvobgo',
        email: 'c.zvobgo@saywhat.org',
        department: 'Operations',
        position: 'Operations Manager',
        subordinateCount: 8,
        reviewCount: 15,
        isHR: false,
        isSupervisor: true
      },
      {
        id: 'rev-005',
        name: 'Blessing Chikwanha',
        email: 'b.chikwanha@saywhat.org',
        department: 'Programs',
        position: 'Program Director',
        subordinateCount: 6,
        reviewCount: 10,
        isHR: false,
        isSupervisor: true
      },
      {
        id: 'rev-006',
        name: 'Farai Ndoro',
        email: 'f.ndoro@saywhat.org',
        department: 'Human Resources',
        position: 'Senior HR Officer',
        subordinateCount: 0,
        reviewCount: 8,
        isHR: true,
        isSupervisor: false
      }
    ];

    return NextResponse.json({
      reviewers: fallbackReviewers,
      data: fallbackReviewers,
      message: 'Reviewers retrieved successfully (fallback data - database unavailable)',
      warning: 'Using fallback data due to database connectivity issues'
    })
  }
}