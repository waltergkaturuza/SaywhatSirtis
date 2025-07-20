import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.permissions?.includes('admin.access')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all permissions with their descriptions
    const permissions = [
      {
        id: 'admin.access',
        name: 'Admin Access',
        description: 'Full administrative access to all system features',
        category: 'Administrative'
      },
      {
        id: 'admin.users',
        name: 'User Management',
        description: 'Create, edit, and delete user accounts',
        category: 'Administrative'
      },
      {
        id: 'admin.roles',
        name: 'Role Management',
        description: 'Create and manage user roles and permissions',
        category: 'Administrative'
      },
      {
        id: 'hr.view',
        name: 'HR View',
        description: 'View HR data and employee information',
        category: 'Human Resources'
      },
      {
        id: 'hr.edit',
        name: 'HR Edit',
        description: 'Edit employee information and HR data',
        category: 'Human Resources'
      },
      {
        id: 'hr.payroll',
        name: 'Payroll Access',
        description: 'Access and manage payroll information',
        category: 'Human Resources'
      },
      {
        id: 'programs.view',
        name: 'Programs View',
        description: 'View programs and project information',
        category: 'Program Management'
      },
      {
        id: 'programs.edit',
        name: 'Programs Edit',
        description: 'Create and edit programs and projects',
        category: 'Program Management'
      },
      {
        id: 'callcentre.access',
        name: 'Call Centre Access',
        description: 'Access call centre features and data',
        category: 'Call Centre'
      },
      {
        id: 'callcentre.manage',
        name: 'Call Centre Management',
        description: 'Manage call centre operations and agents',
        category: 'Call Centre'
      },
      {
        id: 'inventory.view',
        name: 'Inventory View',
        description: 'View inventory items and stock levels',
        category: 'Inventory'
      },
      {
        id: 'inventory.edit',
        name: 'Inventory Edit',
        description: 'Edit inventory items and manage stock',
        category: 'Inventory'
      },
      {
        id: 'documents.view',
        name: 'Documents View',
        description: 'View and download documents',
        category: 'Document Management'
      },
      {
        id: 'documents.edit',
        name: 'Documents Edit',
        description: 'Upload, edit, and manage documents',
        category: 'Document Management'
      },
      {
        id: 'analytics.view',
        name: 'Analytics View',
        description: 'View analytics and reports',
        category: 'Analytics'
      },
      {
        id: 'analytics.advanced',
        name: 'Advanced Analytics',
        description: 'Access advanced analytics and AI insights',
        category: 'Analytics'
      }
    ]

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.permissions?.includes('admin.access')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, permissions } = await request.json()

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'User ID and permissions array are required' },
        { status: 400 }
      )
    }

    // Update user role instead of permissions (RBAC system)
    if (permissions.length > 0) {
      const newRole = permissions[0] as any // Use first permission as role
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
      })
    }

    // Log the permission change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_PERMISSIONS',
        resource: 'User',
        resourceId: userId,
        details: { permissions },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      message: 'Permissions updated successfully',
      permissions 
    })
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
