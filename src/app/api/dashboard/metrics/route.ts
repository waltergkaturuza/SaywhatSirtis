import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date for calculations
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

    // Get member count from User table (representing membership database)
    const totalMembers = await prisma.user.count({
      where: {
        role: {
          not: 'ADMIN' // Exclude admin users from member count
        }
      }
    })

    // Get call statistics
    const [callsThisMonth, callsThisYear, callsToday] = await Promise.all([
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: firstDayOfYear
          }
        }
      }),
      prisma.callCentreRecord.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        }
      })
    ])

    // Get program performance metrics
    const [activePrograms, totalPrograms, programsOnTrack] = await Promise.all([
      prisma.project.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.project.count(),
      prisma.project.count({
        where: {
          status: 'ACTIVE',
          // Consider a program "on track" if it's active and not overdue
          endDate: {
            gte: now
          }
        }
      })
    ])

    // Calculate performance score based on programs
    const performanceScore = totalPrograms > 0 
      ? Math.round((programsOnTrack / activePrograms) * 100) 
      : 0

    return NextResponse.json({
      totalMembers,
      calls: {
        today: callsToday,
        thisMonth: callsThisMonth,
        thisYear: callsThisYear
      },
      programs: {
        active: activePrograms,
        total: totalPrograms,
        onTrack: programsOnTrack,
        performanceScore
      }
    })
    
  } catch (error) {
    console.error('Dashboard metrics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
