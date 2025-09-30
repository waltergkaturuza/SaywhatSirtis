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
            followUpDate: true
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

        return {
          name: officer.officerName || 'Unknown',
          totalCalls: officer._count.id,
          validCalls: validCallsCount,
          cases: casesCount,
          pendingCases: pendingCasesCount,
          closedCases: closedCasesCount,
          overdueCases: overdueCasesCount,
          avgCallDuration: "15 min" // Mock data for now
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
      callsByProvince
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
      error: 'Failed to fetch data'
    }, { status: 500 })
  }
}