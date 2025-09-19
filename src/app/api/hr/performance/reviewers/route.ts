import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await executeQuery(async (prisma) => {
      return prisma.users.findUnique({
        where: { id: session.user.id },
        select: { id: true, roles: true, role: true }
      })
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
    const reviewers = await executeQuery(async (prisma) => {
      return prisma.users.findMany({
        where: {
          isActive: true,
          OR: [ { roles: { has: 'reviewer' } }, { role: 'ADMIN' } ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          position: true,
          roles: true,
          role: true
        },
        orderBy: [ { firstName: 'asc' }, { lastName: 'asc' } ]
      })
    })

    // Fetch workload counts per reviewer (plans where they are reviewer and in specific statuses)
    const reviewerIds = reviewers.map(r => r.id)
    const workloads = reviewerIds.length > 0 ? await executeQuery(async (prisma) => {
      const grouped = await prisma.performance_plans.groupBy({
        by: ['reviewerId'],
        where: {
          reviewerId: { in: reviewerIds },
          status: { in: ['reviewer-review', 'reviewer-approved'] }
        },
        _count: { reviewerId: true }
      })
      return grouped.reduce<Record<string, number>>((acc, g) => {
        acc[g.reviewerId!] = g._count.reviewerId
        return acc
      }, {})
    }) : {}

    // Transform to include workload information
    const reviewersWithWorkload = reviewers.map(reviewer => {
      const count = workloads[reviewer.id] || 0
      return {
        id: reviewer.id,
        name: `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim(),
        email: reviewer.email,
        department: reviewer.department,
        position: reviewer.position,
        isHR: reviewer.roles?.includes('hr') || reviewer.role === 'ADMIN',
        currentWorkload: count,
        availability: count < 10 ? 'available' : count < 20 ? 'busy' : 'overloaded'
      }
    })

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
