import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isHR = user.roles?.includes('hr') || user.role === 'ADMIN'
    const isSupervisor = user.roles?.includes('supervisor')

    // Only supervisors and HR can assign reviewers
    if (!isHR && !isSupervisor) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all users with reviewer role who are active
    const reviewers = await prisma.users.findMany({
      where: {
        isActive: true,
        OR: [
          { roles: { has: 'reviewer' } },
          { role: 'ADMIN' }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        position: true,
        roles: true,
        // Include performance plan counts for workload info
        _count: {
          select: {
            performance_plans_reviewed: {
              where: {
                status: {
                  in: ['reviewer-review', 'reviewer-approved']
                }
              }
            }
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Transform to include workload information
    const reviewersWithWorkload = reviewers.map(reviewer => ({
      id: reviewer.id,
      name: `${reviewer.firstName} ${reviewer.lastName}`,
      email: reviewer.email,
      department: reviewer.department,
      position: reviewer.position,
      isHR: reviewer.roles?.includes('hr') || reviewer.role === 'ADMIN',
      currentWorkload: reviewer._count.performance_plans_reviewed,
      availability: reviewer._count.performance_plans_reviewed < 10 ? 'available' : 
                   reviewer._count.performance_plans_reviewed < 20 ? 'busy' : 'overloaded'
    }))

    return NextResponse.json({
      reviewers: reviewersWithWorkload,
      message: 'Reviewers retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching reviewers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    )
  }
}
