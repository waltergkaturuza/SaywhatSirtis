import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { createSafeJsonResponse } from '@/lib/json-utils'

export async function GET() {
  try {
    console.log('🔍 Testing database connectivity for admin metrics...')
    
    // Test basic connectivity
    await prisma.$connect()
    
    // Get some basic metrics that might have BigInt values
    const metrics = await Promise.all([
      // Test user count (should work)
      prisma.users.count().catch(() => 0),
      
      // Test if we can run a simple aggregation
      prisma.$queryRaw`SELECT COUNT(*)::text as total_tables 
                      FROM information_schema.tables 
                      WHERE table_schema = 'public'`.catch(() => [{ total_tables: '0' }])
    ])
    
    await prisma.$disconnect()
    
    return createSafeJsonResponse({
      success: true,
      message: 'Database connectivity test for admin metrics successful',
      userCount: metrics[0],
      tableInfo: metrics[1],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Admin metrics connectivity test failed:', error)
    
    return createSafeJsonResponse({
      success: false,
      error: 'Admin metrics connectivity test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
}
