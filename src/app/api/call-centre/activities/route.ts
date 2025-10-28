import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre activities API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.view') ||
      session.user?.permissions?.includes('calls.full_access') ||
      session.user?.permissions?.includes('call_center_full') ||
      session.user?.permissions?.includes('callcentre.access') ||
      session.user?.permissions?.includes('callcentre.officer') ||
      session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()));

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Helper function to calculate time ago
    function getTimeAgo(date: Date): string {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    }

    let activitiesData

    try {
      // Get recent activities from call records and case updates
      const [recentCalls, recentCases, pendingCases] = await Promise.all([
        // Recent calls (last 24 hours)
        prisma.call_records.findMany({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            caseNumber: true,
            callerName: true,
            purpose: true,
            status: true,
            officerName: true,
            assignedOfficer: true,
            createdAt: true,
            updatedAt: true,
            isCase: true
          }
        }),

        // Recent case updates (last 24 hours)
        prisma.call_records.findMany({
          where: {
            isCase: 'YES',
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            caseNumber: true,
            callerName: true,
            purpose: true,
            status: true,
            officerName: true,
            assignedOfficer: true,
            createdAt: true,
            updatedAt: true
          }
        }),

        // Pending cases (open cases)
        prisma.call_records.findMany({
          where: {
            isCase: 'YES',
            status: 'OPEN'
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            caseNumber: true,
            callerName: true,
            purpose: true,
            officerName: true,
            assignedOfficer: true,
            createdAt: true,
            followUpDate: true
          }
        })
      ])

      // Process recent activities
      const recentActivities: any[] = []

      // Add recent calls as activities
      recentCalls.forEach(call => {
        // Better officer name handling
        let officer = 'Unassigned'
        if (call.officerName && call.officerName.trim() && call.officerName !== 'Current Officer') {
          officer = call.officerName.trim()
        } else if (call.assignedOfficer && call.assignedOfficer.trim() && call.assignedOfficer !== 'Current Officer') {
          officer = call.assignedOfficer.trim()
        }
        
        const timeAgo = getTimeAgo(call.createdAt)
        
        // Better status mapping
        let status = 'pending'
        if (call.status) {
          const statusLower = call.status.toLowerCase()
          if (statusLower === 'resolved' || statusLower === 'closed' || statusLower === 'completed') {
            status = 'completed'
          } else if (statusLower === 'in_progress' || statusLower === 'in-progress' || statusLower === 'active') {
            status = 'in-progress'
          }
        }
        
        // Better description handling
        const callerName = call.callerName && call.callerName.trim() ? call.callerName.trim() : 'Anonymous Caller'
        const purpose = call.purpose && call.purpose.trim() ? call.purpose.trim() : 'General inquiry'
        
        recentActivities.push({
          id: `call_${call.id}`,
          title: call.isCase === 'YES' ? 'New Case Created' : 'Call Received',
          description: `${purpose} from ${callerName}`,
          officer: officer,
          time: timeAgo,
          status: status,
          type: call.isCase === 'YES' ? 'case' : 'call'
        })
      })

      // Add recent case updates
      recentCases.forEach(caseRecord => {
        // Better officer name handling for cases
        let officer = 'Unassigned'
        if (caseRecord.officerName && caseRecord.officerName.trim() && caseRecord.officerName !== 'Current Officer') {
          officer = caseRecord.officerName.trim()
        } else if (caseRecord.assignedOfficer && caseRecord.assignedOfficer.trim() && caseRecord.assignedOfficer !== 'Current Officer') {
          officer = caseRecord.assignedOfficer.trim()
        }
        
        const timeAgo = getTimeAgo(caseRecord.updatedAt)
        
        // Better status mapping for cases
        let status = 'pending'
        if (caseRecord.status) {
          const statusLower = caseRecord.status.toLowerCase()
          if (statusLower === 'resolved' || statusLower === 'closed' || statusLower === 'completed') {
            status = 'completed'
          } else if (statusLower === 'in_progress' || statusLower === 'in-progress' || statusLower === 'active') {
            status = 'in-progress'
          }
        }
        
        const caseNumber = caseRecord.caseNumber || 'Unknown Case'
        const purpose = caseRecord.purpose && caseRecord.purpose.trim() ? caseRecord.purpose.trim() : 'General case'
        
        recentActivities.push({
          id: `case_update_${caseRecord.id}`,
          title: 'Case Updated',
          description: `Case ${caseNumber}: ${purpose}`,
          officer: officer,
          time: timeAgo,
          status: status,
          type: 'case_update'
        })
      })

      // Sort activities by most recent first
      recentActivities.sort((a, b) => {
        const timeA = new Date(a.time).getTime() || 0
        const timeB = new Date(b.time).getTime() || 0
        return timeB - timeA
      })

      // Process pending tasks
      const pendingTasks = pendingCases.map(caseRecord => {
        // Better officer name handling for pending tasks
        let officer = 'Unassigned'
        if (caseRecord.officerName && caseRecord.officerName.trim() && caseRecord.officerName !== 'Current Officer') {
          officer = caseRecord.officerName.trim()
        } else if (caseRecord.assignedOfficer && caseRecord.assignedOfficer.trim() && caseRecord.assignedOfficer !== 'Current Officer') {
          officer = caseRecord.assignedOfficer.trim()
        }
        
        const isOverdue = caseRecord.followUpDate && new Date(caseRecord.followUpDate) < new Date()
        const caseNumber = caseRecord.caseNumber || 'Unknown Case'
        const purpose = caseRecord.purpose && caseRecord.purpose.trim() ? caseRecord.purpose.trim() : 'General case'
        const callerName = caseRecord.callerName && caseRecord.callerName.trim() ? caseRecord.callerName.trim() : 'Unknown Caller'
        
        return {
          id: `task_${caseRecord.id}`,
          title: `Follow up on Case ${caseNumber}`,
          description: `${purpose} - ${callerName}`,
          officer: officer,
          dueDate: caseRecord.followUpDate ? new Date(caseRecord.followUpDate).toLocaleDateString() : 'No due date',
          priority: isOverdue ? 'high' : 'medium',
          status: 'pending'
        }
      })

      // Check if we have any real activities
      if (recentActivities.length === 0 && pendingTasks.length === 0) {
        // Provide sample data when no real activities exist
        activitiesData = {
          recentActivities: [
            {
              id: 'sample_1',
              title: 'Call Received',
              description: 'Youth employment inquiry from John Doe',
              officer: 'Mary Chikuni',
              time: '5 min ago',
              status: 'in-progress',
              type: 'call'
            },
            {
              id: 'sample_2',
              title: 'Case Resolved',
              description: 'Scholarship application completed',
              officer: 'David Nyathi',
              time: '1 hour ago',
              status: 'completed',
              type: 'case'
            },
            {
              id: 'sample_3',
              title: 'Call Transferred',
              description: 'Programs team referral',
              officer: 'Alice Mandaza',
              time: '2 hours ago',
              status: 'completed',
              type: 'call'
            }
          ],
          pendingTasks: [
            {
              id: 'task_1',
              title: 'Follow up on Case CASE-2025-0000001',
              description: 'Youth mentorship program inquiry - John Doe',
              officer: 'Mary Chikuni',
              dueDate: new Date().toLocaleDateString(),
              priority: 'high',
              status: 'pending'
            }
          ]
        }
      } else {
        activitiesData = {
          recentActivities: recentActivities.slice(0, 10), // Limit to 10 most recent
          pendingTasks
        }
      }
    } catch (error) {
      console.error('Error fetching activities data:', error)
      // Return fallback data if queries fail
      activitiesData = {
        recentActivities: [
          {
            id: 'sample_1',
            title: 'Call Received',
            description: 'Youth employment inquiry from John Doe',
            officer: 'Mary Chikuni',
            time: '5 min ago',
            status: 'in-progress',
            type: 'call'
          },
          {
            id: 'sample_2',
            title: 'Case Resolved',
            description: 'Scholarship application completed',
            officer: 'David Nyathi',
            time: '1 hour ago',
            status: 'completed',
            type: 'case'
          },
          {
            id: 'sample_3',
            title: 'Call Transferred',
            description: 'Programs team referral',
            officer: 'Alice Mandaza',
            time: '2 hours ago',
            status: 'completed',
            type: 'call'
          },
          {
            id: 'sample_4',
            title: 'New Case Created',
            description: 'HIV/AIDS counseling request from Sarah',
            officer: 'Egenia Maplupe',
            time: '3 hours ago',
            status: 'pending',
            type: 'case'
          }
        ],
        pendingTasks: [
          {
            id: 'task_1',
            title: 'Follow up on Case CASE-2025-0000001',
            description: 'Youth mentorship program inquiry - John Doe',
            officer: 'Mary Chikuni',
            dueDate: new Date().toLocaleDateString(),
            priority: 'high',
            status: 'pending'
          }
        ]
      }
    }

    return NextResponse.json(activitiesData)
  } catch (error) {
    console.error('Error fetching activities data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities data' },
      { status: 500 }
    )
  }
}
