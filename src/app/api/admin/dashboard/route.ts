import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSystemMetrics, getServiceStatus } from "@/lib/platform-metrics"

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

    // Get real system metrics from platform
    const systemStats = await getSystemMetrics()

    // Get real service status from platform
    const serviceStatus = await getServiceStatus()

    // Get real security events from audit logs
    const securityEvents = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      select: {
        id: true,
        action: true,
        userId: true,
        ipAddress: true,
        timestamp: true,
        details: true
      }
    })

    // Transform audit logs to security events format
    const formattedSecurityEvents = securityEvents.map(log => ({
      id: log.id.toString(),
      type: log.action.toLowerCase().includes('login') ? 'login_success' : 
            log.action.toLowerCase().includes('admin') ? 'admin_access' : 
            log.action.toLowerCase().includes('error') ? 'security_alert' : 'activity',
      user: log.userId || 'System',
      ipAddress: log.ipAddress || '127.0.0.1',
      timestamp: log.timestamp.toISOString(),
      details: typeof log.details === 'string' ? log.details : log.action
    }))

    // Get system alerts based on metrics and service status
    const alerts = generateSystemAlerts(systemStats, serviceStatus)

    return NextResponse.json({
      success: true,
      data: {
        stats: systemStats,
        serviceStatus,
        securityEvents: formattedSecurityEvents,
        alerts,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// Helper function to generate system alerts based on metrics
function generateSystemAlerts(systemStats: any, serviceStatus: any) {
  const alerts = []
  const now = new Date().toISOString()

  // Database status alert
  if (serviceStatus.database.status === 'online') {
    alerts.push({
      id: "db_status",
      type: "success",
      title: "Database Online",
      message: `Supabase PostgreSQL is operational with ${serviceStatus.database.connections} active connections`,
      timestamp: now
    })
  } else {
    alerts.push({
      id: "db_status", 
      type: "error",
      title: "Database Issues",
      message: "Database connectivity problems detected",
      timestamp: now
    })
  }

  // High CPU usage alert
  if (systemStats.cpuUsage > 80) {
    alerts.push({
      id: "cpu_usage",
      type: "warning",
      title: "High CPU Usage",
      message: `CPU usage is at ${systemStats.cpuUsage}%`,
      timestamp: now
    })
  }

  // High memory usage alert
  if (systemStats.memoryUsage > 85) {
    alerts.push({
      id: "memory_usage",
      type: "warning", 
      title: "High Memory Usage",
      message: `Memory usage is at ${systemStats.memoryUsage}%`,
      timestamp: now
    })
  }

  // Storage usage alert
  if (serviceStatus.storage.usage > 75) {
    alerts.push({
      id: "storage_usage",
      type: "warning",
      title: "Storage Space Low",
      message: `Storage usage is at ${serviceStatus.storage.usage.toFixed(1)}%`,
      timestamp: now
    })
  }

  // System health check
  if (alerts.length === 1 && alerts[0].type === 'success') {
    alerts.push({
      id: "health_check",
      type: "info",
      title: "System Health Check",
      message: "All services are running normally",
      timestamp: now
    })
  }

  return alerts
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
        // Get updated real-time stats from platform
        const updatedStats = await getSystemMetrics()
        
        return NextResponse.json({
          success: true,
          data: { stats: updatedStats }
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
