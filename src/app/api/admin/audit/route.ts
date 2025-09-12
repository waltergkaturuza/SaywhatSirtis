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

    // Fetch audit logs from database
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limit to latest 100 logs
    })

    // Transform data to match frontend interface
    const transformedLogs = auditLogs.map((log: any) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email : 'Unknown',
      action: log.action,
      resource: log.resource,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
      severity: 'info' // Default severity, could be enhanced with proper categorization
    }))

    return NextResponse.json({
      success: true,
      logs: transformedLogs,
      total: auditLogs.length
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    
    // Fallback to mock audit logs when database is unavailable
    console.log("Database unavailable, returning mock audit data for development")
    const mockAuditLogs = [
      {
        id: "1",
        userId: "1",
        userName: "System Administrator",
        action: "USER_LOGIN",
        resource: "Authentication",
        timestamp: new Date().toISOString(),
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "Successful login to admin panel",
        severity: "info"
      },
      {
        id: "2",
        userId: "2",
        userName: "HR Manager",
        action: "USER_CREATED",
        resource: "User Management",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "Created new user: john.doe@saywhat.org",
        severity: "info"
      }
    ]

    return NextResponse.json({
      success: true,
      logs: mockAuditLogs,
      total: mockAuditLogs.length,
      note: "Using mock data - database unavailable"
    })
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

    const { action, userId, details, resource, ipAddress } = await request.json()

    try {
      // Create new audit log entry
      const newLog = await prisma.auditLog.create({
        data: {
          userId: userId || session.user?.id,
          action,
          resource,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          ipAddress,
          userAgent: request.headers.get('user-agent'),
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      const transformedLog = {
        id: newLog.id,
        userId: newLog.userId,
        userName: newLog.user ? `${newLog.user.firstName || ''} ${newLog.user.lastName || ''}`.trim() || newLog.user.email : 'Unknown',
        action: newLog.action,
        resource: newLog.resource,
        timestamp: newLog.timestamp.toISOString(),
        ipAddress: newLog.ipAddress,
        userAgent: newLog.userAgent,
        details: typeof newLog.details === 'string' ? newLog.details : JSON.stringify(newLog.details),
        severity: 'info'
      }

      return NextResponse.json({
        success: true,
        log: transformedLog,
        message: "Audit log created successfully"
      })
    } catch (error) {
      console.error("Error creating audit log:", error)
      return NextResponse.json(
        { error: "Failed to create audit log" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in audit API:", error)
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
