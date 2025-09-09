import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For development, allow access without strict authentication
    const session = await getServerSession(authOptions)
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions (skip in development for testing)
    if (session) {
      const hasPermission = session.user?.permissions?.includes('system.users') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('system_administrator')

      if (!hasPermission && !isDevelopment) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      // Get role assignments for specific user
      try {
        const userRoles = await prisma.userRoleAssignment.findMany({
          where: {
            userId,
            isActive: true
          },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        })

        return NextResponse.json({
          userRoles,
          message: userRoles.length > 0 ? 'User roles retrieved' : 'No roles assigned to user'
        })

      } catch (dbError) {
        // Mock data for development
        const mockUserRoles = [
          {
            id: 'assign_1',
            userId,
            roleId: 'role_basic_1',
            assignedAt: new Date(),
            assignedBy: {
              id: 'admin_1',
              name: 'System Admin',
              email: 'admin@saywhat.com'
            },
            isActive: true,
            role: {
              id: 'role_basic_1',
              name: 'basic_user_1',
              displayName: 'Basic User 1',
              description: 'Basic user with limited access',
              securityClearanceLevel: 1,
              isActive: true
            }
          }
        ]

        return NextResponse.json({
          userRoles: mockUserRoles,
          message: 'Using mock data - RBAC system not yet initialized'
        })
      }
    }

    // Get all user role assignments
    try {
      const allAssignments = await prisma.userRoleAssignment.findMany({
        where: {
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
              level: true
            }
          }
        },
        orderBy: [
          { assignedAt: 'desc' }
        ]
      })

      return NextResponse.json({
        assignments: allAssignments,
        total: allAssignments.length
      })

    } catch (dbError) {
      // Mock data for development
      const mockAssignments = [
        {
          id: 'assign_1',
          userId: 'user_1',
          roleId: 'role_basic_1',
          assignedAt: new Date(),
          isActive: true,
          user: {
            id: 'user_1',
            name: 'John Doe',
            email: 'john@saywhat.com'
          },
          role: {
            id: 'role_basic_1',
            name: 'basic_user_1',
            displayName: 'Basic User 1',
            securityClearanceLevel: 1
          },
          assignedBy: {
            id: 'admin_1',
            name: 'System Admin',
            email: 'admin@saywhat.com'
          }
        }
      ]

      return NextResponse.json({
        assignments: mockAssignments,
        total: mockAssignments.length,
        message: 'Using mock data - RBAC system not yet initialized'
      })
    }

  } catch (error) {
    console.error('Error fetching user role assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user role assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (session) {
      const hasPermission = session.user?.permissions?.includes('system.users') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('system_administrator')

      if (!hasPermission && !isDevelopment) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { userId, roleId, expiresAt } = body

    // Validate required fields
    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, roleId' },
        { status: 400 }
      )
    }

    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Check if role exists
      const role = await prisma.systemRole.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        )
      }

      // Check if assignment already exists
      const existingAssignment = await prisma.userRoleAssignment.findFirst({
        where: {
          userId,
          roleId,
          isActive: true
        }
      })

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'User already has this role assigned' },
          { status: 409 }
        )
      }

      // Create role assignment
      const assignment = await prisma.userRoleAssignment.create({
        data: {
          userId,
          roleId,
          assignmentType: 'direct',
          assignedBy: session?.user?.id || 'system',
          validUntil: expiresAt ? new Date(expiresAt) : null
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
              level: true
            }
          }
        }
      })

      return NextResponse.json({
        assignment,
        message: 'Role assigned successfully'
      }, { status: 201 })

    } catch (dbError) {
      // Mock response for development
      if (isDevelopment) {
        const mockAssignment = {
          id: Date.now().toString(),
          userId,
          roleId,
          assignedAt: new Date(),
          assignedBy: session?.user?.id || 'system',
          validUntil: expiresAt ? new Date(expiresAt) : null,
          isActive: true,
          user: {
            id: userId,
            name: 'Mock User',
            email: 'mock@saywhat.com'
          },
          role: {
            id: roleId,
            name: 'mock_role',
            displayName: 'Mock Role',
            securityClearanceLevel: 1
          }
        }

        return NextResponse.json({
          assignment: mockAssignment,
          message: 'Role assigned successfully (mock mode)'
        }, { status: 201 })
      }

      throw dbError
    }

  } catch (error) {
    console.error('Error assigning role:', error)
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (session) {
      const hasPermission = session.user?.permissions?.includes('system.users') ||
                           session.user?.roles?.includes('admin') ||
                           session.user?.roles?.includes('system_administrator')

      if (!hasPermission && !isDevelopment) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    try {
      // Soft delete the assignment
      const updatedAssignment = await prisma.userRoleAssignment.update({
        where: { id: assignmentId },
        data: {
          isActive: false,
          revokedAt: new Date(),
          revokedBy: session?.user?.id || 'system'
        }
      })

      return NextResponse.json({
        message: 'Role assignment removed successfully'
      })

    } catch (dbError) {
      // Mock response for development
      if (isDevelopment) {
        return NextResponse.json({
          message: 'Role assignment removed successfully (mock mode)'
        })
      }

      if (dbError instanceof Error && dbError.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Assignment not found' },
          { status: 404 }
        )
      }

      throw dbError
    }

  } catch (error) {
    console.error('Error removing role assignment:', error)
    return NextResponse.json(
      { error: 'Failed to remove role assignment' },
      { status: 500 }
    )
  }
}
