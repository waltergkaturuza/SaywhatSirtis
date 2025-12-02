import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'
import { rateLimit, getClientIP } from '@/lib/production-helpers'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP, true)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre summary API')
      return NextResponse.json(
        { error: 'Database connection unavailable' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('callcentre.access') ||
                         session.user?.permissions?.includes('calls.view') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {}

    // Get call statistics
    const totalCalls = await prisma.call_records.count({
      where: dateFilter
    })

    const validCalls = await prisma.call_records.count({
      where: {
        ...dateFilter,
        callValidity: 'valid'
      }
    })

    const invalidCalls = totalCalls - validCalls

    const totalCases = await prisma.call_records.count({
      where: {
        ...dateFilter,
        isCase: 'YES'
      }
    })

    const pendingCases = await prisma.call_records.count({
      where: {
        ...dateFilter,
        isCase: 'YES',
        status: 'OPEN'
      }
    })

    const closedCases = await prisma.call_records.count({
      where: {
        ...dateFilter,
        isCase: 'YES',
        status: 'CLOSED'
      }
    })

    const overdueCases = await prisma.call_records.count({
      where: {
        ...dateFilter,
        isCase: 'YES',
        status: 'OPEN',
        followUpDate: {
          lt: new Date()
        }
      }
    })

    // Calculate average call duration (mock for now)
    const averageCallDuration = "15 min"
    const caseConversionRate = totalCalls > 0 ? `${Math.round((totalCases / totalCalls) * 100)}%` : "0%"

    // Get officer performance data
    const officerStats = await prisma.call_records.groupBy({
      by: ['officerName'],
      where: {
        ...dateFilter,
        officerName: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    const officers = await Promise.all(
      officerStats.map(async (officer) => {
        const officerCalls = await prisma.call_records.findMany({
          where: {
            ...dateFilter,
            officerName: officer.officerName
          },
          select: {
            callValidity: true,
            isCase: true,
            status: true,
            followUpDate: true,
            callStartTime: true,
            callEndTime: true
          }
        })

        const validCallsCount = officerCalls.filter(c => c.callValidity === 'valid').length
        const casesCount = officerCalls.filter(c => c.isCase === 'YES').length
        const pendingCasesCount = officerCalls.filter(c => c.isCase === 'YES' && c.status === 'OPEN').length
        const closedCasesCount = officerCalls.filter(c => c.isCase === 'YES' && c.status === 'CLOSED').length
        const overdueCasesCount = officerCalls.filter(c => 
          c.isCase === 'YES' && 
          c.status === 'OPEN' && 
          c.followUpDate && 
          new Date(c.followUpDate) < new Date()
        ).length

        // Calculate actual average call duration for this officer
        const callsWithDuration = officerCalls.filter(c => c.callStartTime && c.callEndTime);
        let avgDurationMinutes = 0;
        
        if (callsWithDuration.length > 0) {
          const totalDurationMs = callsWithDuration.reduce((sum, call) => {
            const start = new Date(call.callStartTime!).getTime();
            const end = new Date(call.callEndTime!).getTime();
            return sum + (end - start);
          }, 0);
          
          avgDurationMinutes = Math.round(totalDurationMs / callsWithDuration.length / 1000 / 60);
        }

        const avgCallDuration = avgDurationMinutes > 0 ? `${avgDurationMinutes} min` : 'N/A';

        return {
          name: officer.officerName || 'Unknown',
          totalCalls: officer._count.id,
          validCalls: validCallsCount,
          cases: casesCount,
          pendingCases: pendingCasesCount,
          closedCases: closedCasesCount,
          overdueCases: overdueCasesCount,
          avgCallDuration
        }
      })
    )

    // Get cases by purpose
    const purposeStats = await prisma.call_records.groupBy({
      by: ['purpose'],
      where: {
        ...dateFilter,
        isCase: 'YES',
        purpose: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    const casesByPurpose = purposeStats.map(stat => ({
      purpose: stat.purpose || 'Unknown',
      count: stat._count.id,
      percentage: totalCases > 0 ? Math.round((stat._count.id / totalCases) * 100) : 0
    }))

    // Get calls by province
    const provinceStats = await prisma.call_records.groupBy({
      by: ['callerProvince'],
      where: {
        ...dateFilter,
        callerProvince: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    const callsByProvince = await Promise.all(
      provinceStats.map(async (province) => {
        const validCallsInProvince = await prisma.call_records.count({
          where: {
            ...dateFilter,
            callerProvince: province.callerProvince,
            callValidity: 'valid'
          }
        })

        return {
          province: province.callerProvince || 'Unknown',
          calls: province._count.id,
          validCalls: validCallsInProvince
        }
      })
    )

    // Get calls by age group
    const ageStats = await prisma.call_records.groupBy({
      by: ['callerAge'],
      where: {
        ...dateFilter,
        callerAge: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    // Categorize into age groups
    const ageGroups = {
      '0-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    }

    ageStats.forEach(stat => {
      const age = parseInt(stat.callerAge || '0')
      if (age <= 17) ageGroups['0-17'] += stat._count.id
      else if (age <= 24) ageGroups['18-24'] += stat._count.id
      else if (age <= 34) ageGroups['25-34'] += stat._count.id
      else if (age <= 44) ageGroups['35-44'] += stat._count.id
      else if (age <= 54) ageGroups['45-54'] += stat._count.id
      else ageGroups['55+'] += stat._count.id
    })

    const totalWithAge = Object.values(ageGroups).reduce((sum, count) => sum + count, 0)
    const callsByAgeGroup = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: totalWithAge > 0 ? Math.round((count / totalWithAge) * 100) : 0
    })).filter(item => item.count > 0)

    // Get calls by gender
    const genderStats = await prisma.call_records.groupBy({
      by: ['callerGender'],
      where: {
        ...dateFilter,
        callerGender: {
          not: null
        }
      },
      _count: {
        id: true
      }
    })

    const totalWithGender = genderStats.reduce((sum, stat) => sum + stat._count.id, 0)
    const callsByGender = genderStats.map(stat => ({
      gender: stat.callerGender || 'Unknown',
      count: stat._count.id,
      percentage: totalWithGender > 0 ? Math.round((stat._count.id / totalWithGender) * 100) : 0
    })).sort((a, b) => b.count - a.count)

    // Return data in the format expected by the frontend
    const response = {
      stats: {
        totalCalls,
        validCalls,
        invalidCalls,
        totalCases,
        pendingCases,
        closedCases,
        overdueCases,
        averageCallDuration,
        caseConversionRate
      },
      officers,
      casesByPurpose,
      callsByProvince,
      callsByAgeGroup,
      callsByGender
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching call centre summary:', error)
    
    // Return empty data on error instead of failing completely
    return NextResponse.json({
      stats: {
        totalCalls: 0,
        validCalls: 0,
        invalidCalls: 0,
        totalCases: 0,
        pendingCases: 0,
        closedCases: 0,
        overdueCases: 0,
        averageCallDuration: "0 min",
        caseConversionRate: "0%"
      },
      officers: [],
      casesByPurpose: [],
      callsByProvince: [],
      callsByAgeGroup: [],
      callsByGender: [],
      error: 'Failed to fetch data'
    }, { status: 500 })
  }
}