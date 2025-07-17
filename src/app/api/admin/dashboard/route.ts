import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock data - in production, this would come from your database
const systemStats = {
  totalUsers: 245,
  activeUsers: 89,
  totalDocuments: 1234,
  systemUptime: "99.9%",
  storageUsed: "2.4 TB",
  apiCalls: 15678,
  errorRate: 0.02,
  responseTime: 145,
  cpuUsage: 45,
  memoryUsage: 67,
  diskUsage: 34,
  networkUsage: 23
}

const securityEvents = [
  {
    id: "1",
    type: "login_success",
    user: "john.doe@saywhat.org",
    ipAddress: "192.168.1.100",
    timestamp: new Date().toISOString(),
    details: "Successful login with 2FA"
  },
  {
    id: "2",
    type: "login_failed",
    user: "unknown@external.com",
    ipAddress: "45.123.456.789",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: "Failed login attempt - invalid credentials"
  },
  {
    id: "3",
    type: "password_change",
    user: "jane.smith@saywhat.org",
    ipAddress: "192.168.1.101",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    details: "Password successfully changed"
  }
]

const alerts = [
  {
    id: "1",
    type: "success",
    title: "System Backup Completed",
    message: "Daily backup completed successfully",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "2",
    type: "warning",
    title: "High Memory Usage Detected",
    message: "Memory usage is above 65% threshold",
    timestamp: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: "3",
    type: "success",
    title: "Security Scan Completed",
    message: "No vulnerabilities detected",
    timestamp: new Date(Date.now() - 21600000).toISOString()
  }
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    // In production, check against user roles/permissions
    if (!session.user?.email?.includes("admin") && !session.user?.email?.includes("john.doe")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    return NextResponse.json({
      stats: systemStats,
      securityEvents,
      alerts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
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

    const { action, data } = await request.json()

    switch (action) {
      case "refresh_stats":
        // Simulate refreshing system stats
        const updatedStats = {
          ...systemStats,
          apiCalls: systemStats.apiCalls + Math.floor(Math.random() * 100),
          responseTime: 120 + Math.floor(Math.random() * 50),
          cpuUsage: Math.max(20, Math.min(80, systemStats.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(30, Math.min(90, systemStats.memoryUsage + (Math.random() - 0.5) * 10))
        }
        
        return NextResponse.json({
          success: true,
          stats: updatedStats
        })

      case "create_backup":
        // Simulate creating a backup
        return NextResponse.json({
          success: true,
          message: "Backup created successfully",
          backupId: `backup_${Date.now()}`
        })

      case "restart_service":
        // Simulate restarting a service
        return NextResponse.json({
          success: true,
          message: `Service ${data.serviceName} restarted successfully`
        })

      case "clear_cache":
        // Simulate clearing cache
        return NextResponse.json({
          success: true,
          message: "System cache cleared successfully"
        })

      case "update_config":
        // Simulate updating system configuration
        return NextResponse.json({
          success: true,
          message: `Configuration ${data.key} updated to ${data.value}`
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error processing admin action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
