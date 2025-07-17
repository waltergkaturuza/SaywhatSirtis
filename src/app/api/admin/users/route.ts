import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock user data - in production, this would come from your database
let users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@saywhat.org",
    role: "Administrator",
    department: "IT",
    lastLogin: "2025-07-17 09:30:00",
    status: "active",
    createdAt: "2024-01-15",
    permissions: ["admin", "user_management", "system_config"]
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@saywhat.org",
    role: "HR Manager",
    department: "HR",
    lastLogin: "2025-07-17 08:45:00",
    status: "active",
    createdAt: "2024-02-01",
    permissions: ["hr_management", "employee_data"]
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@saywhat.org",
    role: "Programs Manager",
    department: "Programs",
    lastLogin: "2025-07-16 17:20:00",
    status: "active",
    createdAt: "2024-03-10",
    permissions: ["programs_management", "project_data"]
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@saywhat.org",
    role: "Call Centre Agent",
    department: "Call Centre",
    lastLogin: "2025-07-17 07:15:00",
    status: "suspended",
    createdAt: "2024-05-20",
    permissions: ["call_centre"]
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get("search")
    const role = url.searchParams.get("role")
    const status = url.searchParams.get("status")
    const department = url.searchParams.get("department")

    let filteredUsers = users

    // Apply filters
    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department)
    }

    return NextResponse.json({
      users: filteredUsers,
      total: filteredUsers.length,
      departments: [...new Set(users.map(u => u.department))],
      roles: [...new Set(users.map(u => u.role))]
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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
      case "create_user":
        const newUser = {
          id: (users.length + 1).toString(),
          ...userData,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: "Never",
          status: "active"
        }
        users.push(newUser)
        
        return NextResponse.json({
          success: true,
          message: "User created successfully",
          user: newUser
        })

      case "update_user":
        const userIndex = users.findIndex(u => u.id === userId)
        if (userIndex === -1) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        
        users[userIndex] = { ...users[userIndex], ...userData }
        
        return NextResponse.json({
          success: true,
          message: "User updated successfully",
          user: users[userIndex]
        })

      case "toggle_status":
        const user = users.find(u => u.id === userId)
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        
        user.status = user.status === "active" ? "suspended" : "active"
        
        return NextResponse.json({
          success: true,
          message: `User ${user.status === "active" ? "activated" : "suspended"} successfully`,
          user
        })

      case "delete_user":
        users = users.filter(u => u.id !== userId)
        
        return NextResponse.json({
          success: true,
          message: "User deleted successfully"
        })

      case "reset_password":
        const userToReset = users.find(u => u.id === userId)
        if (!userToReset) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        
        // In production, generate a secure temporary password and send via email
        const tempPassword = `temp_${Math.random().toString(36).substring(2, 10)}`
        
        return NextResponse.json({
          success: true,
          message: "Password reset successfully",
          tempPassword // In production, don't return this, send via email
        })

      case "bulk_action":
        const { userIds, bulkAction } = userData
        
        switch (bulkAction) {
          case "suspend":
            users = users.map(u => 
              userIds.includes(u.id) ? { ...u, status: "suspended" } : u
            )
            break
          case "activate":
            users = users.map(u => 
              userIds.includes(u.id) ? { ...u, status: "active" } : u
            )
            break
          case "delete":
            users = users.filter(u => !userIds.includes(u.id))
            break
        }
        
        return NextResponse.json({
          success: true,
          message: `Bulk ${bulkAction} completed for ${userIds.length} users`
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error processing user management action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
