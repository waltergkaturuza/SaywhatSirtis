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

    // Every summary section uses this same filter so province, officer,
    // dates, and the other search fields apply across all tables.
    const { searchParams } = new URL(request.url)
    const officerName = searchParams.get('officerName')?.trim() || ''
    const dateFrom = searchParams.get('dateFrom') || searchParams.get('startDate')
    const dateTo = searchParams.get('dateTo') || searchParams.get('endDate')
    const province = searchParams.get('province')?.trim() || ''
    const callerId = (searchParams.get('callerId') || searchParams.get('callerIdNumber'))?.trim() || ''
    const caseNumber = searchParams.get('caseNumber')?.trim() || ''
    const gender = searchParams.get('gender')?.trim() || ''
    const validCallsFilter = searchParams.get('validCalls')?.trim() || ''
    const purposeFilter = searchParams.get('purpose')?.trim() || ''
    const language = searchParams.get('language')?.trim() || ''
    const communicationMode = searchParams.get('communicationMode')?.trim() || ''

    const isAll = (value: string) => !value || value.toLowerCase() === 'all'
    const andConditions: Record<string, unknown>[] = []

    if (officerName) {
      andConditions.push({
        OR: [
          { officerName: { contains: officerName, mode: 'insensitive' } },
          { assignedOfficer: { contains: officerName, mode: 'insensitive' } },
        ],
      })
    }

    if (!isAll(province)) {
      andConditions.push({
        OR: [
          { callerProvince: { equals: province, mode: 'insensitive' } },
          { clientProvince: { equals: province, mode: 'insensitive' } },
        ],
      })
    }

    if (callerId) {
      andConditions.push({
        OR: [
          { callerPhone: { contains: callerId, mode: 'insensitive' } },
          { callNumber: { contains: callerId, mode: 'insensitive' } },
        ],
      })
    }

    if (caseNumber) {
      andConditions.push({
        caseNumber: { contains: caseNumber, mode: 'insensitive' },
      })
    }

    if (!isAll(gender)) {
      const genderMatch = (field: 'callerGender' | 'clientSex') => ({
        OR: [
          { [field]: null },
          { [field]: '' },
          { [field]: { equals: 'N/A', mode: 'insensitive' } },
          { [field]: { equals: 'NA', mode: 'insensitive' } },
        ],
      })

      if (gender.toLowerCase() === 'n/a') {
        andConditions.push({
          AND: [genderMatch('callerGender'), genderMatch('clientSex')],
        })
      } else {
        andConditions.push({
          OR: [
            { callerGender: { equals: gender, mode: 'insensitive' } },
            { clientSex: { equals: gender, mode: 'insensitive' } },
          ],
        })
      }
    }

    if (validCallsFilter === 'valid') {
      andConditions.push({
        callValidity: { equals: 'valid', mode: 'insensitive' },
      })
    } else if (validCallsFilter === 'invalid') {
      andConditions.push({
        NOT: { callValidity: { equals: 'valid', mode: 'insensitive' } },
      })
    }

    if (!isAll(purposeFilter)) {
      andConditions.push({
        purpose: { equals: purposeFilter, mode: 'insensitive' },
      })
    }

    if (!isAll(language)) {
      andConditions.push({
        language: { equals: language, mode: 'insensitive' },
      })
    }

    if (!isAll(communicationMode)) {
      const modeAliases: Record<string, string[]> = {
        inbound: ['inbound', 'Inbound Call'],
        outbound: ['outbound', 'Outbound Call'],
        whatsapp: ['whatsapp', 'WhatsApp'],
        walk: ['walk', 'Walk-in', 'walk-in'],
        text: ['text', 'Text/SMS', 'Text Message', 'SMS'],
      }
      const aliases = modeAliases[communicationMode.toLowerCase()] || [communicationMode]
      andConditions.push({
        OR: aliases.flatMap((value) => ([
          { modeOfCommunication: { equals: value, mode: 'insensitive' } },
          { callType: { equals: value, mode: 'insensitive' } },
        ])),
      })
    }

    const attributeWhere = andConditions.length > 0 ? { AND: andConditions } : {}

    type DateRange = { gte?: Date; lte?: Date }
    const userDateRange: DateRange = {}
    if (dateFrom) userDateRange.gte = new Date(dateFrom)
    if (dateTo) userDateRange.lte = new Date(`${dateTo}T23:59:59.999`)

    const effectiveDateCondition = (range: DateRange) => ({
      OR: [
        { callStartTime: { not: null, ...range } },
        { callStartTime: null, createdAt: range },
      ],
    })

    const intersectDateRanges = (user: DateRange, window: DateRange): DateRange | null => {
      const gteCandidates = [user.gte, window.gte].filter((value): value is Date => !!value)
      const lteCandidates = [user.lte, window.lte].filter((value): value is Date => !!value)
      const gte = gteCandidates.length
        ? new Date(Math.max(...gteCandidates.map(value => value.getTime())))
        : undefined
      const lte = lteCandidates.length
        ? new Date(Math.min(...lteCandidates.map(value => value.getTime())))
        : undefined
      if (gte && lte && gte.getTime() > lte.getTime()) return null
      const range: DateRange = {}
      if (gte) range.gte = gte
      if (lte) range.lte = lte
      return range
    }

    const recordWhere = dateFrom || dateTo
      ? { AND: [attributeWhere, effectiveDateCondition(userDateRange)] }
      : attributeWhere

    const countInWindow = (windowStart: Date, extra: Record<string, unknown> = {}) => {
      const range = intersectDateRanges(userDateRange, { gte: windowStart })
      if (!range) return Promise.resolve(0)
      return prisma.call_records.count({
        where: {
          AND: [attributeWhere, extra, effectiveDateCondition(range)],
        },
      })
    }

    // Get call statistics
    const totalCalls = await prisma.call_records.count({
      where: recordWhere
    })

    const validCalls = await prisma.call_records.count({
      where: {
        AND: [
          recordWhere,
          { callValidity: { equals: 'valid', mode: 'insensitive' } },
        ],
      }
    })

    const invalidCalls = totalCalls - validCalls

    const totalCases = await prisma.call_records.count({
      where: {
        ...recordWhere,
        isCase: 'YES'
      }
    })

    const pendingCases = await prisma.call_records.count({
      where: {
        ...recordWhere,
        isCase: 'YES',
        status: 'OPEN'
      }
    })

    const closedCases = await prisma.call_records.count({
      where: {
        ...recordWhere,
        isCase: 'YES',
        status: 'CLOSED'
      }
    })

    const overdueCases = await prisma.call_records.count({
      where: {
        ...recordWhere,
        isCase: 'YES',
        status: 'OPEN',
        followUpDate: {
          lt: new Date()
        }
      }
    })

    const durationRows = await prisma.call_records.findMany({
      where: {
        AND: [
          recordWhere,
          { callStartTime: { not: null } },
          { callEndTime: { not: null } },
        ],
      },
      select: { callStartTime: true, callEndTime: true },
    })
    const averageMinutes = durationRows.length > 0
      ? Math.round(
          durationRows.reduce((sum, call) => {
            const start = new Date(call.callStartTime!).getTime()
            const end = new Date(call.callEndTime!).getTime()
            return sum + Math.max(0, end - start)
          }, 0) / durationRows.length / 1000 / 60
        )
      : 0
    const averageCallDuration = averageMinutes > 0 ? `${averageMinutes} min` : 'N/A'
    const caseConversionRate = totalCalls > 0 ? `${Math.round((totalCases / totalCalls) * 100)}%` : "0%"

    // Get officer performance data
    const officerStats = await prisma.call_records.groupBy({
      by: ['officerName'],
      where: {
        ...recordWhere,
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
            ...recordWhere,
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

        const validCallsCount = officerCalls.filter(c => (c.callValidity || '').toLowerCase() === 'valid').length
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

    const unnamedOfficerCalls = await prisma.call_records.findMany({
      where: {
        AND: [
          recordWhere,
          { OR: [{ officerName: null }, { officerName: '' }] },
        ],
      },
      select: {
        assignedOfficer: true,
        callValidity: true,
        isCase: true,
        status: true,
        followUpDate: true,
        callStartTime: true,
        callEndTime: true,
      },
    })

    const groupedUnnamed = new Map<string, typeof unnamedOfficerCalls>()
    for (const call of unnamedOfficerCalls) {
      const name = call.assignedOfficer?.trim() || 'Unassigned'
      const bucket = groupedUnnamed.get(name) || []
      bucket.push(call)
      groupedUnnamed.set(name, bucket)
    }

    for (const [name, calls] of groupedUnnamed) {
      const validCallsCount = calls.filter(c => (c.callValidity || '').toLowerCase() === 'valid').length
      const casesCount = calls.filter(c => c.isCase === 'YES').length
      const pendingCasesCount = calls.filter(c => c.isCase === 'YES' && c.status === 'OPEN').length
      const closedCasesCount = calls.filter(c => c.isCase === 'YES' && c.status === 'CLOSED').length
      const overdueCasesCount = calls.filter(c =>
        c.isCase === 'YES' &&
        c.status === 'OPEN' &&
        c.followUpDate &&
        new Date(c.followUpDate) < new Date()
      ).length
      const callsWithDuration = calls.filter(c => c.callStartTime && c.callEndTime)
      const avgDurationMinutes = callsWithDuration.length > 0
        ? Math.round(
            callsWithDuration.reduce((sum, call) => {
              return sum + (new Date(call.callEndTime!).getTime() - new Date(call.callStartTime!).getTime())
            }, 0) / callsWithDuration.length / 1000 / 60
          )
        : 0

      const existing = officers.find(officer => officer.name.toLowerCase() === name.toLowerCase())
      if (existing) {
        existing.totalCalls += calls.length
        existing.validCalls += validCallsCount
        existing.cases += casesCount
        existing.pendingCases += pendingCasesCount
        existing.closedCases += closedCasesCount
        existing.overdueCases += overdueCasesCount
      } else {
        officers.push({
          name,
          totalCalls: calls.length,
          validCalls: validCallsCount,
          cases: casesCount,
          pendingCases: pendingCasesCount,
          closedCases: closedCasesCount,
          overdueCases: overdueCasesCount,
          avgCallDuration: avgDurationMinutes > 0 ? `${avgDurationMinutes} min` : 'N/A',
        })
      }
    }

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
        ...recordWhere,
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
        const purposeScope = { isCase: 'YES', purpose }

        const today = await countInWindow(todayStart, purposeScope)
        const week = await countInWindow(weekStart, purposeScope)
        const month = await countInWindow(monthStart, purposeScope)
        const year = await countInWindow(yearStart, purposeScope)

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
        ...recordWhere,
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

    const provincesToShow = !isAll(province)
      ? allProvinces.filter(name => name.toLowerCase() === province.toLowerCase())
      : allProvinces

    const callsByProvince = !isAll(province)
      ? [{
          province: provincesToShow[0] || province,
          calls: totalCalls,
          validCalls,
        }]
      : await Promise.all(
      provincesToShow.map(async (provinceName) => {
        const matchingProvinces = provinceStats.filter(p =>
          (p.callerProvince || '').trim().toLowerCase() === provinceName.toLowerCase()
        )

        const totalCallsForProvince = matchingProvinces.reduce((sum, p) => sum + p._count.id, 0)

        const validCallsInProvince = matchingProvinces.length > 0
          ? await prisma.call_records.count({
              where: {
                AND: [
                  recordWhere,
                  {
                    OR: matchingProvinces.map(p => ({ callerProvince: p.callerProvince })),
                    callValidity: { equals: 'valid', mode: 'insensitive' },
                  },
                ],
              },
            })
          : 0

        return {
          province: provinceName,
          calls: totalCallsForProvince,
          validCalls: validCallsInProvince
        }
      })
    )

    // Calls by age group (stored bands: ZERO, 1-14, 15-19, … plus legacy "-14" / numeric ages)
    const ageStats = await prisma.call_records.groupBy({
      by: ['callerAge'],
      where: {
        ...recordWhere,
        callerAge: { not: null },
      },
      _count: { id: true },
    })

    const nullOrEmptyAgeCount = await prisma.call_records.count({
      where: {
        ...recordWhere,
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
      where: recordWhere,
      select: {
        callerAge: true,
        callerKeyPopulation: true,
        callerProvince: true,
        clientProvince: true,
        callValidity: true,
      },
    })

    if (isAll(province)) {
      const blankProvince = (value?: string | null) => {
        const normalized = (value || '').trim().toLowerCase()
        return !normalized || normalized === 'n/a' || normalized === 'na'
      }
      for (const row of demoRows) {
        if (!blankProvince(row.callerProvince)) continue
        const clientName = (row.clientProvince || '').trim()
        const target = callsByProvince.find(item => item.province.toLowerCase() === clientName.toLowerCase())
        if (!target) continue
        target.calls += 1
        if ((row.callValidity || '').toLowerCase() === 'valid') target.validCalls += 1
      }
    }

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

    // Gender uses the caller value, and the client value when the caller gender was not recorded.
    const genderRows = await prisma.call_records.findMany({
      where: recordWhere,
      select: { callerGender: true, clientSex: true },
    })

    const canonicalGender = (value?: string | null) => {
      const normalized = (value || '').trim().toLowerCase()
      if (normalized === 'male') return 'Male'
      if (normalized === 'female') return 'Female'
      if (!normalized || normalized === 'n/a' || normalized === 'na') return 'N/A'
      return value!.trim()
    }

    const selectedGender = !isAll(gender) ? canonicalGender(gender) : ''
    const genderBuckets: Record<string, number> = {}
    for (const row of genderRows) {
      const callerLabel = canonicalGender(row.callerGender)
      const clientLabel = canonicalGender(row.clientSex)
      const label = selectedGender || (callerLabel !== 'N/A' ? callerLabel : clientLabel)
      genderBuckets[label] = (genderBuckets[label] || 0) + 1
    }

    const totalWithGender = genderRows.length
    const callsByGender = Object.entries(genderBuckets)
      .map(([label, count]) => ({
        gender: label,
        count,
        percentage: totalWithGender > 0 ? Math.round((count / totalWithGender) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    const callsToday = await countInWindow(todayStart)
    const callsThisWeek = await countInWindow(weekStart)
    const callsThisMonth = await countInWindow(monthStart)
    const callsThisYear = await countInWindow(yearStart)

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