import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock audit log data - in production, this would come from your database
let auditLogs = [
  {
    id: "1",
    userId: "admin",
    userName: "System Administrator",
    action: "USER_LOGIN",
    resource: "Authentication System",
    timestamp: "2025-07-17 10:15:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Successful login with two-factor authentication",
    severity: "info"
  },
  {
    id: "2",
    userId: "jane.smith",
    userName: "Jane Smith",
    action: "DOCUMENT_UPLOAD",
    resource: "Document Repository",
    timestamp: "2025-07-17 10:10:00",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Uploaded performance appraisal document (ID: DOC_2025_001)",
    severity: "info"
  },
  {
    id: "3",
    userId: "unknown",
    userName: "Unknown User",
    action: "LOGIN_FAILED",
    resource: "Authentication System",
    timestamp: "2025-07-17 09:45:00",
    ipAddress: "45.123.456.789",
    userAgent: "curl/7.68.0",
    details: "Failed login attempt - invalid credentials for user: external@test.com",
    severity: "warning"
  },
  {
    id: "4",
    userId: "mike.johnson",
    userName: "Mike Johnson",
    action: "PROJECT_CREATED",
    resource: "Programs Management",
    timestamp: "2025-07-17 09:30:00",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Created new project: Community Health Initiative 2025",
    severity: "info"
  },
  {
    id: "5",
    userId: "admin",
    userName: "System Administrator",
    action: "CONFIG_CHANGE",
    resource: "System Configuration",
    timestamp: "2025-07-17 08:20:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Updated system configuration: max_file_size changed from 40MB to 50MB",
    severity: "warning"
  },
  {
    id: "6",
    userId: "sarah.wilson",
    userName: "Sarah Wilson",
    action: "CALL_LOGGED",
    resource: "Call Centre",
    timestamp: "2025-07-17 08:15:00",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Logged new call case: CASE_2025_789 - Customer complaint resolved",
    severity: "info"
  },
  {
    id: "7",
    userId: "system",
    userName: "System Process",
    action: "BACKUP_COMPLETED",
    resource: "Database",
    timestamp: "2025-07-17 02:00:00",
    ipAddress: "127.0.0.1",
    userAgent: "System/1.0",
    details: "Automated daily backup completed successfully (Size: 2.4GB)",
    severity: "info"
  },
  {
    id: "8",
    userId: "admin",
    userName: "System Administrator",
    action: "USER_SUSPENDED",
    resource: "User Management",
    timestamp: "2025-07-16 16:45:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: "Suspended user account: sarah.wilson@saywhat.org due to policy violation",
    severity: "critical"
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
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "50")
    const action = url.searchParams.get("action")
    const userId = url.searchParams.get("userId")
    const resource = url.searchParams.get("resource")
    const severity = url.searchParams.get("severity")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let filteredLogs = [...auditLogs]

    // Apply filters
    if (action) {
      filteredLogs = filteredLogs.filter(log =>
        log.action.toLowerCase().includes(action.toLowerCase())
      )
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log =>
        log.userId.toLowerCase().includes(userId.toLowerCase()) ||
        log.userName.toLowerCase().includes(userId.toLowerCase())
      )
    }

    if (resource) {
      filteredLogs = filteredLogs.filter(log =>
        log.resource.toLowerCase().includes(resource.toLowerCase())
      )
    }

    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity)
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) <= new Date(endDate)
      )
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      totalPages: Math.ceil(filteredLogs.length / limit),
      filters: {
        actions: [...new Set(auditLogs.map(log => log.action))],
        resources: [...new Set(auditLogs.map(log => log.resource))],
        severities: [...new Set(auditLogs.map(log => log.severity))],
        users: [...new Set(auditLogs.map(log => ({ id: log.userId, name: log.userName })))]
      }
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
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
      case "add_log":
        const newLog = {
          id: (auditLogs.length + 1).toString(),
          userId: session.user?.email || "unknown",
          userName: session.user?.name || "Unknown User",
          action: data.action,
          resource: data.resource,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          ipAddress: data.ipAddress || "127.0.0.1",
          userAgent: data.userAgent || "Unknown",
          details: data.details,
          severity: data.severity || "info"
        }
        
        auditLogs.unshift(newLog) // Add to beginning of array
        
        return NextResponse.json({
          success: true,
          message: "Audit log entry added successfully",
          log: newLog
        })

      case "export_logs":
        // In production, generate CSV/Excel file
        const exportData = {
          format: data.format || "csv",
          logs: auditLogs,
          timestamp: new Date().toISOString(),
          exportedBy: session.user?.email
        }
        
        return NextResponse.json({
          success: true,
          message: "Audit logs exported successfully",
          downloadUrl: `/api/admin/audit/export?token=${Date.now()}`, // Mock URL
          data: exportData
        })

      case "delete_old_logs":
        const cutoffDate = new Date(data.cutoffDate)
        const initialCount = auditLogs.length
        
        auditLogs = auditLogs.filter(log =>
          new Date(log.timestamp) >= cutoffDate
        )
        
        const deletedCount = initialCount - auditLogs.length
        
        return NextResponse.json({
          success: true,
          message: `Deleted ${deletedCount} old audit log entries`,
          deletedCount
        })

      case "archive_logs":
        // In production, move logs to archive storage
        const archiveDate = new Date(data.archiveDate)
        const logsToArchive = auditLogs.filter(log =>
          new Date(log.timestamp) < archiveDate
        )
        
        return NextResponse.json({
          success: true,
          message: `Archived ${logsToArchive.length} audit log entries`,
          archivedCount: logsToArchive.length,
          archiveId: `archive_${Date.now()}`
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error processing audit log action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
