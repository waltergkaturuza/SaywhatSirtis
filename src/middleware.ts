import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Request logging store
const requestLog: Array<{
  timestamp: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  duration?: number;
  status?: number;
}> = []

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
  message: 'Too many requests, please try again later',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

/**
 * Check rate limit for a client
 */
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key)
    }
  }
  
  const clientData = rateLimitStore.get(clientId)
  
  if (!clientData || clientData.resetTime < windowStart) {
    // First request in this window
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs
    rateLimitStore.set(clientId, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime
    }
  }
  
  if (clientData.count >= RATE_LIMIT_CONFIG.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: clientData.resetTime
    }
  }
  
  // Increment counter
  clientData.count++
  rateLimitStore.set(clientId, clientData)
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - clientData.count,
    resetTime: clientData.resetTime
  }
}

/**
 * Log request information
 */
function logRequest(
  request: NextRequest,
  response?: NextResponse,
  duration?: number,
  userId?: string
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: getClientIP(request),
    userId,
    duration,
    status: response?.status
  }
  
  requestLog.push(logEntry)
  
  // Keep only last 1000 requests in memory
  if (requestLog.length > 1000) {
    requestLog.shift()
  }
  
  // Console log for development
  console.log(`[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} - ${logEntry.status || 'pending'} - ${logEntry.duration || 0}ms - IP: ${logEntry.ip} - User: ${logEntry.userId || 'anonymous'}`)
}

/**
 * Security headers middleware
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CORS headers for API routes
  response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://sirtis.saywhat.org' : '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Skip middleware for static files and Next.js internals
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }
  
  // Get user info for logging
  let userId: string | undefined
  try {
    const token = await getToken({ req: request })
    userId = token?.email as string
  } catch (error) {
    // Ignore token errors for public routes
  }
  
  // Check rate limit for API routes (but skip auth routes to prevent login issues)
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/')) {
    const clientId = userId || getClientIP(request)
    const rateLimit = checkRateLimit(clientId)
    
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: RATE_LIMIT_CONFIG.message,
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())
      response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString())
      
      // Log the rate limit violation
      logRequest(request, response, Date.now() - startTime, userId)
      
      return addSecurityHeaders(response)
    }
    
    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString())
    
    // Log the request
    logRequest(request, undefined, undefined, userId)
    
    return addSecurityHeaders(response)
  }
  
  // For non-API routes, just add security headers and log
  const response = NextResponse.next()
  logRequest(request, undefined, undefined, userId)
  
  return addSecurityHeaders(response)
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

/**
 * Get request logs (for admin dashboard)
 */
export function getRequestLogs(limit: number = 100) {
  return requestLog.slice(-limit).reverse()
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const now = Date.now()
  const activeClients = Array.from(rateLimitStore.entries())
    .filter(([_, data]) => data.resetTime > now)
    .map(([clientId, data]) => ({
      clientId,
      requestCount: data.count,
      resetTime: new Date(data.resetTime).toISOString()
    }))
  
  return {
    totalActiveClients: activeClients.length,
    clients: activeClients.sort((a, b) => b.requestCount - a.requestCount)
  }
}
