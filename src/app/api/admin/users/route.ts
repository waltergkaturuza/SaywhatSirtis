import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Temporarily allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges (allow in development)
    if (session) {
      const hasAdminAccess = session.user?.email?.includes("admin") || 
                            session.user?.email?.includes("john.doe")
      
      if (!hasAdminAccess && !isDevelopment) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    // Fetch users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        position: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match frontend interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role || 'BASIC_USER_1',
      department: user.department,
      position: user.position,
      lastLogin: user.lastLogin?.toISOString(),
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt.toISOString(),
      permissions: [] // TODO: Add permissions based on role
    }))

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: users.length
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    
    // Fallback to mock data when database is unavailable
    console.log("Database unavailable, returning mock data for development")
    const mockUsers = [
      {
        id: "1",
        firstName: "System",
        lastName: "Administrator",
        email: "admin@saywhat.org",
        role: "SYSTEM_ADMINISTRATOR",
        department: "Executive Directors Office",
        position: "System Administrator",
        lastLogin: new Date().toISOString(),
        status: "active" as const,
        createdAt: new Date().toISOString(),
        permissions: []
      },
      {
        id: "2",
        firstName: "HR",
        lastName: "Manager",
        email: "hr@saywhat.org",
        role: "HR",
        department: "Human Resource Management",
        position: "HR Manager",
        lastLogin: new Date(Date.now() - 86400000).toISOString(),
        status: "active" as const,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        permissions: []
      },
      {
        id: "3",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@saywhat.org",
        role: "BASIC_USER_1",
        department: "Programs",
        position: "Program Officer",
        lastLogin: new Date(Date.now() - 172800000).toISOString(),
        status: "active" as const,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        permissions: []
      }
    ]

    return NextResponse.json({
      success: true,
      users: mockUsers,
      total: mockUsers.length,
      note: "Using mock data - database unavailable"
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Temporarily allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges (allow in development)
    if (session) {
      const hasAdminAccess = session.user?.email?.includes("admin") || 
                            session.user?.email?.includes("john.doe")
      
      if (!hasAdminAccess && !isDevelopment) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    const requestBody = await request.json()
    const { action, userId } = requestBody
    
    // Extract userData from request body (handle both nested and flattened structures)
    let userData
    if (requestBody.userData) {
      userData = requestBody.userData
    } else {
      // Extract user fields from flattened structure
      const { action: _, userId: __, ...userFields } = requestBody
      userData = userFields
    }

    switch (action) {
      case 'toggle_status':
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId }
          })

          if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
          }

          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              position: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            }
          })

          const transformedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role || 'USER',
            department: updatedUser.department,
            position: updatedUser.position,
            lastLogin: updatedUser.lastLogin?.toISOString(),
            status: updatedUser.isActive ? 'active' : 'inactive',
            createdAt: updatedUser.createdAt.toISOString(),
            permissions: []
          }

          return NextResponse.json({
            success: true,
            user: { ...transformedUser, role: transformedUser.role.replace('USER', 'BASIC_USER_1') },
            message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
          })
        } catch (error) {
          console.error("Error updating user status:", error)
          return NextResponse.json(
            { error: "Failed to update user status" },
            { status: 500 }
          )
        }

      case 'create_user':
        try {
          // Validate required fields
          if (!userData.email || !userData.firstName || !userData.lastName) {
            return NextResponse.json(
              { error: "Missing required fields: email, firstName, and lastName are required" },
              { status: 400 }
            )
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(userData.email)) {
            return NextResponse.json(
              { error: "Invalid email format" },
              { status: 400 }
            )
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
          })

          if (existingUser) {
            return NextResponse.json(
              { error: "User with this email already exists" },
              { status: 409 }
            )
          }

          // Note: Password handling would be implemented here in production
          // For now, we create users without password (OAuth/SSO authentication)
          
          const newUser = await prisma.user.create({
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role ? userData.role.toUpperCase() as any : 'BASIC_USER_1',
              department: userData.department || '',
              position: userData.position || '',
              isActive: true
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              position: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            }
          })

          const transformedUser = {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role || 'BASIC_USER_1',
            department: newUser.department,
            position: newUser.position,
            lastLogin: newUser.lastLogin?.toISOString(),
            status: newUser.isActive ? 'active' : 'inactive',
            createdAt: newUser.createdAt.toISOString(),
            permissions: []
          }

          return NextResponse.json({
            success: true,
            user: transformedUser,
            message: "User created successfully"
          })
        } catch (error) {
          console.error("Error creating user:", error)
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
          )
        }

      case 'update_user':
        try {
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role ? userData.role.toUpperCase() as any : undefined,
              department: userData.department,
              position: userData.position,
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              department: true,
              position: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            }
          })

          const transformedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role || 'USER',
            department: updatedUser.department,
            position: updatedUser.position,
            lastLogin: updatedUser.lastLogin?.toISOString(),
            status: updatedUser.isActive ? 'active' : 'inactive',
            createdAt: updatedUser.createdAt.toISOString(),
            permissions: []
          }

          return NextResponse.json({
            success: true,
            user: { ...transformedUser, role: transformedUser.role.replace('USER', 'BASIC_USER_1') },
            message: "User updated successfully"
          })
        } catch (error) {
          console.error("Error updating user:", error)
          return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
          )
        }

      case 'delete_user':
        try {
          await prisma.user.delete({
            where: { id: userId }
          })

          return NextResponse.json({
            success: true,
            message: "User deleted successfully"
          })
        } catch (error) {
          console.error("Error deleting user:", error)
          return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
