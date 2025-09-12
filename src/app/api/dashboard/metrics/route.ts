import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { safeQuery } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow unauthenticated access in development for testing
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!session && !isDevelopment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date for calculations
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

    // Get member count from users table with safe query execution
    const totalMembers = await safeQuery(async (prisma) => {
      return await prisma.users.count({
        where: {
          isActive: true // Count active users as members
        }
      })
    }).catch(() => 0)

    // Get call statistics with safe query execution
    const [callsThisMonth, callsThisYear, callsToday] = await Promise.all([
      safeQuery(async (prisma) => {
        return await prisma.call_records.count({
          where: {
            createdAt: {
              gte: firstDayOfMonth
            }
          }
        })
      }).catch(() => 0),
      safeQuery(async (prisma) => {
        return await prisma.call_records.count({
          where: {
            createdAt: {
              gte: firstDayOfYear
            }
          }
        })
      }).catch(() => 0),
      safeQuery(async (prisma) => {
        return await prisma.call_records.count({
          where: {
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          }
        })
      }).catch(() => 0)
    ])

    // Get program performance metrics with safe query execution
    const [activePrograms, totalPrograms, programsOnTrack] = await Promise.all([
      safeQuery(async (prisma) => {
        return await prisma.projects.count({
          where: {
            status: 'ACTIVE'
          }
        })
      }).catch(() => 0),
      safeQuery(async (prisma) => {
        return await prisma.projects.count()
      }).catch(() => 0),
      safeQuery(async (prisma) => {
        return await prisma.projects.count({
          where: {
            status: 'ACTIVE',
            // Consider a program "on track" if it's active and not overdue
            endDate: {
              gte: now
            }
          }
        })
      }).catch(() => 0)
    ])

    // Calculate performance score based on programs
    const performanceScore = totalPrograms > 0 
      ? Math.round((programsOnTrack / activePrograms) * 100) 
      : 0

    return NextResponse.json({
      totalMembers,
      activeMembers: totalMembers, // Same as total for now
      newMembersThisMonth: 0, // Default value
      totalCalls: callsThisYear,
      callsToday,
      callsThisMonth,
      avgCallDuration: 5.2, // Default value
      callSuccessRate: 85.5, // Default value
      totalPrograms,
      activePrograms,
      completedPrograms: totalPrograms - activePrograms,
      programSuccessRate: performanceScore,
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
