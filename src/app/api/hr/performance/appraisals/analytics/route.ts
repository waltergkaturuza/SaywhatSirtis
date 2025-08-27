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

    // Basic analytics for performance appraisals
    const totalReviews = await prisma.performanceReview.count()
    const completedReviews = await prisma.performanceReview.count({
      where: { reviewType: 'annual' }
    })
    const quarterlyReviews = await prisma.performanceReview.count({
      where: { reviewType: 'quarterly' }
    })

    // Calculate average rating
    const avgRating = await prisma.performanceReview.aggregate({
      _avg: {
        overallRating: true
      }
    })

    const analytics = {
      totalReviews,
      completedReviews,
      quarterlyReviews,
      averageRating: avgRating._avg.overallRating || 0
    }

    const response = createSuccessResponse(analytics, {
      message: 'Performance appraisal analytics retrieved successfully'
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error('Performance appraisal analytics error:', error)
    const { response, status } = createErrorResponse(
      'Failed to retrieve analytics',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: ErrorCodes.INTERNAL_SERVER_ERROR }
    )
    return NextResponse.json(response, { status })
  }
}