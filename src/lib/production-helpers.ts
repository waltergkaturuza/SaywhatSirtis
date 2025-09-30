// Rate limiting and error handling for production stability
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // per IP per minute
  apiMaxRequests: 30 // for API endpoints
}

export function rateLimit(ip: string, isApi: boolean = false): boolean {
  const now = Date.now()
  const key = `${ip}:${isApi ? 'api' : 'page'}`
  const limit = isApi ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests
  
  const record = requestCounts.get(key) || { count: 0, resetTime: now + RATE_LIMIT.windowMs }
  
  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + RATE_LIMIT.windowMs
  }
  
  record.count++
  requestCounts.set(key, record)
  
  return record.count <= limit
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<{ success: boolean; data?: T; error?: string } | T> {
  try {
    const result = await operation()
    
    // If operation returns a NextResponse, return it directly
    if (result && typeof result === 'object' && 'status' in result) {
      return result
    }
    
    return { success: true, data: result }
  } catch (error) {
    console.error(`Error in ${context}:`, error)
    
    // Handle Prisma errors
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as any
      
      switch (prismaError.code) {
        case 'P2002':
          return {
            success: false,
            error: 'Duplicate data detected. Please try again with different values.'
          }
        case 'P2025':
          return {
            success: false,
            error: 'Record not found.'
          }
        case 'P2003':
          return {
            success: false,
            error: 'Invalid reference data provided.'
          }
        default:
          return {
            success: false,
            error: `Database error: ${prismaError.message || 'Unknown database error'}`
          }
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Cleanup function to prevent memory leaks
export function cleanupRateLimitData(): void {
  const now = Date.now()
  
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
    }
  }
}

// Run cleanup every 5 minutes (only in server environment)
if (typeof global !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitData, 5 * 60 * 1000)
}