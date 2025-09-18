import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/hr/notifications/categories - Get notification categories
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

    // Get categories
    const categories = await prisma.notification_categories.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Transform categories for frontend
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      notificationCount: category.count || 0
    }))

    return NextResponse.json({
      success: true,
      data: transformedCategories
    })

  } catch (error) {
    console.error('Error fetching notification categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification categories' },
      { status: 500 }
    )
  }
}

// POST /api/hr/notifications/categories - Create new category
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
      icon,
      color
    } = body

    // Create category
    const category = await prisma.notification_categories.create({
      data: {
        name,
        description,
        icon,
        color,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category
    })

  } catch (error) {
    console.error('Error creating notification category:', error)
    return NextResponse.json(
      { error: 'Failed to create notification category' },
      { status: 500 }
    )
  }
}