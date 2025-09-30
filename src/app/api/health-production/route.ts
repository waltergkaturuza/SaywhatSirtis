import { NextRequest, NextResponse } from 'next/server'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Basic server health
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      checks: {
        server: true,
        database: false,
        env: false
      }
    }

    // Check environment variables
    const requiredEnvs = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
    const missingEnvs = requiredEnvs.filter(env => !process.env[env])
    health.checks.env = missingEnvs.length === 0

    if (missingEnvs.length > 0) {
      console.error('Missing environment variables:', missingEnvs)
    }

    // Check database connection with timeout
    try {
      const dbCheck = await Promise.race([
        checkDatabaseConnection(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database check timeout')), 5000)
        )
      ])
      health.checks.database = dbCheck as boolean
    } catch (error) {
      console.error('Database health check failed:', error)
      health.checks.database = false
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      ...health,
      responseTimeMs: responseTime,
      allChecksPass: Object.values(health.checks).every(check => check)
    }, { 
      status: health.checks.server ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'production'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTimeMs: Date.now() - startTime,
      allChecksPass: false
    }, { status: 503 })
  }
}