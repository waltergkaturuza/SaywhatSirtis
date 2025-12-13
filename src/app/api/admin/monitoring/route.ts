import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/admin-auth'
// Note: getRequestLogs and getRateLimitStats removed - middleware simplified
// TODO: Implement request logging and rate limiting in a separate service if needed
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

    // Check if user has admin privileges
    if (!hasAdminAccess(session)) {
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
        // Request logs temporarily disabled - middleware simplified
        const logs: any[] = []
        
        const response = createSuccessResponse({
          logs,
          totalCount: logs.length
        }, {
          message: `Retrieved ${logs.length} request logs`
        })
        
        return NextResponse.json(response)

      case 'ratelimit':
        // Rate limit stats temporarily disabled - middleware simplified
        const rateLimitStats: any = {}
        
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
          requestLogs: [],
          rateLimitStats: {},
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
