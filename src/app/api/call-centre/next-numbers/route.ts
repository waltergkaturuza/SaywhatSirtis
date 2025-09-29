import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in next-numbers API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!session.user.permissions?.includes('callcentre.access')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const currentYear = new Date().getFullYear()

    // Get next call number
    const maxCallQuery = await prisma.call_records.findFirst({
      where: {
        callNumber: {
          endsWith: `/${currentYear}`
        }
      },
      orderBy: {
        callNumber: 'desc'
      },
      select: {
        callNumber: true
      }
    })

    let nextCallNumber = 1
    if (maxCallQuery?.callNumber) {
      const numberPart = maxCallQuery.callNumber.split('/')[0]
      if (numberPart && !isNaN(parseInt(numberPart))) {
        nextCallNumber = parseInt(numberPart) + 1
      }
    }

    // Format the call number (7 digits for call numbers)
    const formattedCallNumber = `${nextCallNumber.toString().padStart(5, '0')}/${currentYear}`

    // Get next case number
    const maxCaseQuery = await prisma.call_records.findFirst({
      where: {
        caseNumber: {
          startsWith: `CASE-${currentYear}-`,
          not: null
        }
      },
      orderBy: {
        caseNumber: 'desc'
      },
      select: {
        caseNumber: true
      }
    })

    let nextCaseNumber = 1
    if (maxCaseQuery?.caseNumber) {
      const numberPart = maxCaseQuery.caseNumber.split('-')[2]
      if (numberPart && !isNaN(parseInt(numberPart))) {
        nextCaseNumber = parseInt(numberPart) + 1
      }
    }

    // Format the case number (8 digits for case numbers)
    const formattedCaseNumber = `CASE-${currentYear}-${nextCaseNumber.toString().padStart(8, '0')}`

    return NextResponse.json({
      success: true,
      data: {
        nextCallNumber: formattedCallNumber,
        nextCaseNumber: formattedCaseNumber,
        year: currentYear,
        callCount: nextCallNumber - 1, // Total existing calls
        caseCount: nextCaseNumber - 1  // Total existing cases
      }
    })

  } catch (error) {
    console.error('Error fetching next numbers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch next numbers' },
      { status: 500 }
    )
  }
}