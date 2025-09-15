import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Simple test response
    return NextResponse.json({
      success: true,
      plans: [],
      statistics: {
        total: 0,
        draft: 0,
        supervisorReview: 0,
        supervisorApproved: 0,
        reviewerReview: 0,
        reviewerApproved: 0,
        completed: 0,
        pendingReview: 0,
        approved: 0
      },
      message: 'Performance plans API is working'
    })

  } catch (error) {
    console.error('Error in performance plans API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
