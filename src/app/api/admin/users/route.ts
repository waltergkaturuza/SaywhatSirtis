import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
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
      role: user.role || 'USER',
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
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch users",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { action, userId, userData } = await request.json()

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
            user: transformedUser,
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
          const newUser = await prisma.user.create({
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role || 'USER',
              department: userData.department,
              position: userData.position,
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
            role: newUser.role || 'USER',
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
              role: userData.role,
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
            user: transformedUser,
            message: "User updated successfully"
          })
        } catch (error) {
          console.error("Error updating user:", error)
          return NextResponse.json(
            { error: "Failed to update user" },
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
