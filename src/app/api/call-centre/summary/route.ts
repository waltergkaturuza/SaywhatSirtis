import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'
import { rateLimit, getClientIP } from '@/lib/production-helpers'
import {
  DISPLAY_AGE_GROUP_ORDER,
  KEY_POPULATION_COLUMNS,
  displayAgeGroupSortIndex,
  mapStoredCallerAgeToBucket,
} from '@/lib/call-centre/caller-demographics'

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

    // Calculate timeframe dates (used for both calls and purpose)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const yearStart = new Date(now.getFullYear(), 0, 1)

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
      percentage:
        totalCases > 0 ? Math.round((stat._count.id / totalCases) * 100) : 0,
    }))

    // Get purpose distribution by timeframe

    // Get all unique purposes
    const allPurposes = [...new Set(purposeStats.map(s => s.purpose || 'Unknown'))]

    const purposeByTimeframe = await Promise.all(
      allPurposes.map(async (purpose) => {
        const today = await prisma.call_records.count({
          where: {
            isCase: 'YES',
            purpose: purpose,
            createdAt: { gte: todayStart }
          }
        })

        const week = await prisma.call_records.count({
          where: {
            isCase: 'YES',
            purpose: purpose,
            createdAt: { gte: weekStart }
          }
        })

        const month = await prisma.call_records.count({
          where: {
            isCase: 'YES',
            purpose: purpose,
            createdAt: { gte: monthStart }
          }
        })

        const year = await prisma.call_records.count({
          where: {
            isCase: 'YES',
            purpose: purpose,
            createdAt: { gte: yearStart }
          }
        })

        return {
          purpose,
          today,
          week,
          month,
          year,
          total: purposeStats.find(s => s.purpose === purpose)?._count.id || 0
        }
      })
    )

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

    // All Zimbabwe provinces - ensure all are shown even with 0 calls
    const allProvinces = [
      'Harare', 'Bulawayo', 'Manicaland', 'Mashonaland Central', 
      'Mashonaland East', 'Mashonaland West', 'Masvingo', 
      'Matabeleland North', 'Matabeleland South', 'Midlands'
    ]

    const callsByProvince = await Promise.all(
      allProvinces.map(async (provinceName) => {
        const provinceData = provinceStats.find(p => 
          p.callerProvince?.toLowerCase() === provinceName.toLowerCase()
        )

        const totalCalls = provinceData?._count.id || 0

        // Find matching province name (case-insensitive) from stats
        const matchingProvince = provinceStats.find(p => 
          p.callerProvince?.toLowerCase() === provinceName.toLowerCase()
        )
        
        // Count valid calls for this province
        const validCallsInProvince = matchingProvince 
          ? await prisma.call_records.count({
              where: {
                ...dateFilter,
                callerProvince: matchingProvince.callerProvince,
                callValidity: 'valid'
              }
            })
          : 0

        return {
          province: provinceName,
          calls: totalCalls,
          validCalls: validCallsInProvince
        }
      })
    )

    // Calls by age group (stored bands: ZERO, 1-14, 15-19, … plus legacy "-14" / numeric ages)
    const ageStats = await prisma.call_records.groupBy({
      by: ['callerAge'],
      where: {
        ...dateFilter,
        callerAge: { not: null },
      },
      _count: { id: true },
    })

    const nullOrEmptyAgeCount = await prisma.call_records.count({
      where: {
        ...dateFilter,
        OR: [{ callerAge: null }, { callerAge: '' }],
      },
    })

    const ageBuckets: Record<string, number> = Object.fromEntries(
      DISPLAY_AGE_GROUP_ORDER.map(g => [g, 0])
    ) as Record<string, number>

    ageBuckets['Zero'] += nullOrEmptyAgeCount

    ageStats.forEach(stat => {
      const raw = stat.callerAge
      if (raw == null || String(raw).trim() === '') return
      const bucket = mapStoredCallerAgeToBucket(raw)
      if (bucket) ageBuckets[bucket] += stat._count.id
    })

    const totalWithAge = Object.values(ageBuckets).reduce((sum, c) => sum + c, 0)
    const callsByAgeGroup = DISPLAY_AGE_GROUP_ORDER.map(ageGroup => {
      const count = ageBuckets[ageGroup] ?? 0
      return {
        ageGroup,
        count,
        percentage:
          totalWithAge > 0 ? Math.round((count / totalWithAge) * 100) : 0,
      }
    }).filter(item => item.count > 0)

    callsByAgeGroup.sort(
      (a, b) =>
        displayAgeGroupSortIndex(a.ageGroup) - displayAgeGroupSortIndex(b.ageGroup)
    )

    // Age × key population (invalid / unknown age → Zero ↔ Invalid in summaries)
    const demoRows = await prisma.call_records.findMany({
      where: dateFilter,
      select: { callerAge: true, callerKeyPopulation: true },
    })

    type Kp = (typeof KEY_POPULATION_COLUMNS)[number]
    const matrix: Record<string, Record<Kp, number>> = {} as Record<
      string,
      Record<Kp, number>
    >
    for (const ag of DISPLAY_AGE_GROUP_ORDER) {
      matrix[ag] = {
        Child: 0,
        'Young Person': 0,
        Adult: 0,
        'N/A': 0,
        Invalid: 0,
      }
    }

    for (const row of demoRows) {
      const bucket = mapStoredCallerAgeToBucket(row.callerAge) ?? 'Zero'
      const rawKp = row.callerKeyPopulation?.trim() || 'N/A'
      const kp = (KEY_POPULATION_COLUMNS as readonly string[]).includes(rawKp)
        ? (rawKp as Kp)
        : 'N/A'
      matrix[bucket][kp] += 1
    }

    const ageKeyPopulationCrossTab = {
      ageGroups: [...DISPLAY_AGE_GROUP_ORDER],
      keyPopulations: [...KEY_POPULATION_COLUMNS],
      rows: DISPLAY_AGE_GROUP_ORDER.map(ageGroup => {
        const cells = KEY_POPULATION_COLUMNS.map(kp => ({
          keyPopulation: kp,
          count: matrix[ageGroup][kp],
        }))
        const rowTotal = cells.reduce((s, c) => s + c.count, 0)
        return { ageGroup, cells, rowTotal }
      }),
    }

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

    // Calculate calls by timeframe (using dates calculated above)
    const callsToday = await prisma.call_records.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    })

    const callsThisWeek = await prisma.call_records.count({
      where: {
        createdAt: {
          gte: weekStart
        }
      }
    })

    const callsThisMonth = await prisma.call_records.count({
      where: {
        createdAt: {
          gte: monthStart
        }
      }
    })

    const callsThisYear = await prisma.call_records.count({
      where: {
        createdAt: {
          gte: yearStart
        }
      }
    })

    const callsByTimeframe = {
      today: callsToday,
      week: callsThisWeek,
      month: callsThisMonth,
      year: callsThisYear
    }

    // Sort provinces by call count (descending) to show most active first, but keep 0-call provinces at the end
    const sortedCallsByProvince = callsByProvince.sort((a, b) => {
      if (a.calls === 0 && b.calls > 0) return 1
      if (b.calls === 0 && a.calls > 0) return -1
      return b.calls - a.calls
    })

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
      purposeByTimeframe,
      callsByProvince: sortedCallsByProvince,
      callsByAgeGroup,
      ageKeyPopulationCrossTab,
      callsByGender,
      callsByTimeframe,
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
      purposeByTimeframe: [],
      callsByProvince: [],
      callsByAgeGroup: [],
      ageKeyPopulationCrossTab: {
        ageGroups: [...DISPLAY_AGE_GROUP_ORDER],
        keyPopulations: [...KEY_POPULATION_COLUMNS],
        rows: DISPLAY_AGE_GROUP_ORDER.map(ageGroup => ({
          ageGroup,
          cells: KEY_POPULATION_COLUMNS.map(keyPopulation => ({
            keyPopulation,
            count: 0,
          })),
          rowTotal: 0,
        })),
      },
      callsByGender: [],
      callsByTimeframe: {today: 0, week: 0, month: 0, year: 0},
      error: 'Failed to fetch data'
    }, { status: 500 })
  }
}