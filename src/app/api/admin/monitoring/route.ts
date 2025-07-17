import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRequestLogs, getRateLimitStats } from '@/middleware'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  HttpStatus,
  ErrorCodes
} from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      const { response, status } = createErrorResponse(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
        { code: ErrorCodes.UNAUTHORIZED }
      )
      return NextResponse.json(response, { status })
    }

    // Check if user has admin privileges (simple check for demo)
    if (!session.user.email.includes('admin') && !session.user.email.includes('john.doe')) {
      const { response, status } = createErrorResponse(
        'Insufficient permissions',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.FORBIDDEN }
      )
      return NextResponse.json(response, { status })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'logs':
        const limit = parseInt(searchParams.get('limit') || '100')
        const logs = getRequestLogs(limit)
        
        const response = createSuccessResponse({
          logs,
          totalCount: logs.length
        }, {
          message: `Retrieved ${logs.length} request logs`
        })
        
        return NextResponse.json(response)

      case 'ratelimit':
        const rateLimitStats = getRateLimitStats()
        
        const rateLimitResponse = createSuccessResponse(rateLimitStats, {
          message: 'Rate limit statistics retrieved'
        })
        
        return NextResponse.json(rateLimitResponse)

      case 'system':
        const systemMetrics = {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
        
        const systemResponse = createSuccessResponse(systemMetrics, {
          message: 'System metrics retrieved'
        })
        
        return NextResponse.json(systemResponse)

      default:
        // Overview combining all metrics
        const overviewData = {
          requestLogs: getRequestLogs(50),
          rateLimitStats: getRateLimitStats(),
          systemMetrics: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
          }
        }
        
        const overviewResponse = createSuccessResponse(overviewData, {
          message: 'System overview retrieved'
        })
        
        return NextResponse.json(overviewResponse)
    }
  } catch (error) {
    console.error('Error in monitoring endpoint:', error)
    
    const { response, status } = createErrorResponse(
      'Failed to retrieve monitoring data',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { 
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    )
    
    return NextResponse.json(response, { status })
  }
}
