import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RecentActivity {
  id: string
  type: string
  icon: string
  title: string
  description: string
  timestamp: string
  timeAgo: string
  color: string
}

// Fallback data for when database is not available
const fallbackActivities = [
  {
    id: '1',
    type: 'employee_onboarded',
    icon: 'UserPlus',
    title: 'New employee onboarded',
    description: 'John Doe joined the Operations team',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    color: 'green'
  },
  {
    id: '2',
    type: 'performance_review',
    icon: 'Star',
    title: 'Performance review completed',
    description: "Sarah Johnson's Q4 review scored 4.8/5",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    color: 'yellow'
  },
  {
    id: '3',
    type: 'training_scheduled',
    icon: 'AcademicCap',
    title: 'Training session scheduled',
    description: 'Leadership Development program starts Monday',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    color: 'purple'
  },
  {
    id: '4',
    type: 'performance_reviews_completed',
    icon: 'DocumentText',
    title: 'Performance reviews completed',
    description: 'Q1 2024 performance reviews completed for 15 employees',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    color: 'blue'
  },
  {
    id: '5',
    type: 'department_created',
    icon: 'BuildingOffice',
    title: 'Department restructured',
    description: 'IT department created new Security subunit',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    color: 'indigo'
  }
]

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else {
    const days = Math.floor(diffInMinutes / (24 * 60))
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get session, but don't require it for fallback data
    const session = await getServerSession(authOptions)
    
    // If no session, return fallback data with formatted timestamps
    if (!session) {
      const activitiesWithFormattedTime = fallbackActivities.map(activity => ({
        ...activity,
        timeAgo: formatTimeAgo(activity.timestamp)
      }))
      return NextResponse.json(activitiesWithFormattedTime)
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('hr.view') ||
                         session.user?.permissions?.includes('hr.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('hr_manager')

    // If no permission, return fallback data
    if (!hasPermission) {
      const activitiesWithFormattedTime = fallbackActivities.map(activity => ({
        ...activity,
        timeAgo: formatTimeAgo(activity.timestamp)
      }))
      return NextResponse.json(activitiesWithFormattedTime)
    }

    try {
      // Get recent activities from database
      const recentEmployees = await prisma.employee.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          departmentRef: {
            select: { name: true }
          }
        }
      })

      const recentTrainings = await prisma.event.findMany({
        where: { type: 'training' },
        take: 2,
        orderBy: { createdAt: 'desc' }
      })

      // Combine and format activities
      const activities: RecentActivity[] = []

      // Add employee activities
      recentEmployees.forEach(employee => {
        activities.push({
          id: `emp_${employee.id}`,
          type: 'employee_onboarded',
          icon: 'UserPlus',
          title: 'New employee onboarded',
          description: `${employee.firstName} ${employee.lastName} joined the ${employee.departmentRef?.name || employee.department || 'Unknown'} team`,
          timestamp: employee.createdAt.toISOString(),
          timeAgo: formatTimeAgo(employee.createdAt.toISOString()),
          color: 'green'
        })
      })

      // Add training activities
      recentTrainings.forEach(training => {
        activities.push({
          id: `training_${training.id}`,
          type: 'training_scheduled',
          icon: 'AcademicCap',
          title: 'Training session scheduled',
          description: training.title,
          timestamp: training.createdAt.toISOString(),
          timeAgo: formatTimeAgo(training.createdAt.toISOString()),
          color: 'purple'
        })
      })

      // Sort by timestamp and take latest 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      const latestActivities = activities.slice(0, 5)

      // If we have real data but not enough, supplement with fallback
      if (latestActivities.length < 3) {
        const supplementalActivities = fallbackActivities
          .slice(latestActivities.length)
          .map(activity => ({
            ...activity,
            timeAgo: formatTimeAgo(activity.timestamp)
          }))
        latestActivities.push(...supplementalActivities)
      }

      return NextResponse.json(latestActivities.slice(0, 5))

    } catch (dbError) {
      console.error('Database error, falling back to default activities:', dbError)
      const activitiesWithFormattedTime = fallbackActivities.map(activity => ({
        ...activity,
        timeAgo: formatTimeAgo(activity.timestamp)
      }))
      return NextResponse.json(activitiesWithFormattedTime)
    }

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    const activitiesWithFormattedTime = fallbackActivities.map(activity => ({
      ...activity,
      timeAgo: formatTimeAgo(activity.timestamp)
    }))
    return NextResponse.json(activitiesWithFormattedTime)
  }
}
