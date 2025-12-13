import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { hasAdminAccess } from "@/lib/admin-auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Temporarily allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges (allow in development)
    if (session && !hasAdminAccess(session) && !isDevelopment) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Fetch audit logs from database
    const auditLogs = await prisma.audit_logs.findMany({
      include: {
        users: {
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
      userId: log.userId || 'system',
      userName: log.users ? `${log.users.firstName || ''} ${log.users.lastName || ''}`.trim() || log.users.email : 'System User',
      userEmail: log.users?.email || 'system@saywhat.org',
      action: log.action,
      resource: log.resource,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress || '127.0.0.1',
      userAgent: log.userAgent || 'Unknown',
      details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}),
      severity: log.action?.includes('ERROR') || log.action?.includes('FAIL') ? 'error' : 
                log.action?.includes('WARN') ? 'warning' : 'info',
      outcome: log.action?.includes('ERROR') || log.action?.includes('FAIL') ? 'failure' : 'success'
    }))

    return NextResponse.json({
      success: true,
      logs: transformedLogs,
      total: auditLogs.length
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch audit logs",
      logs: [],
      total: 0
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // For audit log creation, we allow broader access (not just admins) since various parts of the system need to log
    const { action, userId, details, resource, resourceId, ipAddress: clientIP } = body
    
    // Get client information
    const ipAddress = clientIP || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    // Handle special admin actions that require admin privileges
    if (action === 'clear_logs') {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Check if user has admin privileges
      if (!hasAdminAccess(session)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      // Clear audit logs (keep last 10 for reference)
      try {
        const logsToKeep = await prisma.audit_logs.findMany({
          orderBy: { timestamp: 'desc' },
          take: 10,
          select: { id: true }
        })
        
        await prisma.audit_logs.deleteMany({
          where: {
            id: {
              notIn: logsToKeep.map(log => log.id)
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: "Audit logs cleared successfully"
        })
      } catch (error) {
        console.error("Error clearing audit logs:", error)
        return NextResponse.json(
          { error: "Failed to clear audit logs" },
          { status: 500 }
        )
      }
    }

    // Create new audit log entry
    try {
      const newLog = await prisma.audit_logs.create({
        data: {
          id: randomUUID(),
          userId: userId || session?.user?.id || null,
          action,
          resource,
          resourceId: resourceId || null,
          details: details || {},
          ipAddress,
          userAgent,
          timestamp: new Date()
        },
        include: {
          users: {
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
        userName: newLog.users ? `${newLog.users.firstName || ''} ${newLog.users.lastName || ''}`.trim() || newLog.users.email : 'System User',
        userEmail: newLog.users?.email || 'system@saywhat.org',
        action: newLog.action,
        resource: newLog.resource,
        timestamp: newLog.timestamp.toISOString(),
        ipAddress: newLog.ipAddress,
        userAgent: newLog.userAgent,
        details: typeof newLog.details === 'string' ? newLog.details : JSON.stringify(newLog.details || {}),
        severity: newLog.action?.includes('ERROR') || newLog.action?.includes('FAIL') ? 'error' : 'info',
        outcome: newLog.action?.includes('ERROR') || newLog.action?.includes('FAIL') ? 'failure' : 'success'
      }

      return NextResponse.json({
        success: true,
        log: transformedLog,
        message: "Audit log created successfully"
      })
    } catch (error) {
      console.error("Error creating audit log:", error)
      return NextResponse.json(
        { error: "Failed to create audit log", details: error instanceof Error ? error.message : 'Unknown error' },
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
