import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, HttpStatus, ErrorCodes } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Basic analytics for call centre
    const totalCalls = await prisma.callRecord.count()
    const completedCalls = await prisma.callRecord.count({
      where: { status: 'COMPLETED' }
    })
    const pendingCalls = await prisma.callRecord.count({
      where: { status: 'PENDING' }
    })

    const analytics = {
      totalCalls,
      completedCalls,
      pendingCalls,
      completionRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0
    }

    const response = createSuccessResponse(analytics, {
      message: 'Call centre analytics retrieved successfully'
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error('Call centre analytics error:', error)
    const { response, status } = createErrorResponse(
      'Failed to retrieve analytics',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: ErrorCodes.INTERNAL_SERVER_ERROR }
    )
    return NextResponse.json(response, { status })
  }
}