import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/hr/notifications/routing - Get routing rules
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.some(role => ['SUPERUSER', 'ADMIN', 'HR_MANAGER', 'HR_SPECIALIST'].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get routing rules
    const routingRules = await prisma.notification_routing_rules.findMany({
      include: {
        routes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform routing rules for frontend
    const transformedRules = routingRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      isActive: rule.isActive,
      successRate: rule.successRate,
      lastTriggered: rule.lastTriggered,
      routes: rule.routes.map(route => ({
        id: route.id,
        recipient: route.recipient,
        action: route.action,
        deadline: route.deadline,
        order: route.order
      }))
    }))

    return NextResponse.json({
      success: true,
      data: transformedRules
    })

  } catch (error) {
    console.error('Error fetching routing rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routing rules' },
      { status: 500 }
    )
  }
}

// POST /api/hr/notifications/routing - Create new routing rule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.edit') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.some(role => ['SUPERUSER', 'ADMIN', 'HR_MANAGER'].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      trigger,
      routes
    } = body

    // Create routing rule with routes in a transaction
    const routingRule = await prisma.$transaction(async (tx) => {
      // Create the routing rule
      const rule = await tx.notification_routing_rules.create({
        data: {
          name,
          description,
          trigger,
          isActive: true,
          createdBy: session.user.id
        }
      })

      // Create the routes
      if (routes && routes.length > 0) {
        await tx.notification_routes.createMany({
          data: routes.map((route: any, index: number) => ({
            ruleId: rule.id,
            recipient: route.recipient,
            action: route.action,
            deadline: route.deadline,
            order: index
          }))
        })
      }

      return rule
    })

    return NextResponse.json({
      success: true,
      message: 'Routing rule created successfully',
      data: routingRule
    })

  } catch (error) {
    console.error('Error creating routing rule:', error)
    return NextResponse.json(
      { error: 'Failed to create routing rule' },
      { status: 500 }
    )
  }
}