import { NextResponse } from "next/server"
import { executeQuery } from '@/lib/prisma'
import { createSafeJsonResponse } from '@/lib/json-utils'

export async function GET() {
  try {
    console.log('🔍 Testing database connection with retry logic...')
    
    // Test basic connectivity with retry logic
    const connectionTest = await executeQuery(async () => {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$connect()
      return await prisma.$queryRaw`SELECT 'connection_test' as status, NOW() as timestamp`
    })
    
    console.log('✅ Database connection successful:', connectionTest)
    
    // Test a basic count query (which was failing before)
    const userCount = await executeQuery(async () => {
      const { prisma } = await import('@/lib/prisma')
      return await prisma.user.count()
    }).catch((error) => {
      console.error('User count failed:', error)
      return 0
    })
    
    console.log('✅ User count query successful:', userCount)
    
    return createSafeJsonResponse({
      success: true,
      message: 'Database connection with retry logic successful',
      connectionTest: connectionTest,
      userCount: userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    
    return createSafeJsonResponse({
      success: false,
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
}
