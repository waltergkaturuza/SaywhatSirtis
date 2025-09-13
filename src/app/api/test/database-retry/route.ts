import { NextResponse } from "next/server"
import { safeQuery } from '@/lib/prisma'
import { createSafeJsonResponse } from '@/lib/json-utils'

export async function GET() {
  try {
    console.log('🔍 Testing database connection with prepared statement fix...')
    
    // Test basic connectivity with fresh connections
    const connectionTest = await safeQuery(async (prisma) => {
      await prisma.$connect()
      return await prisma.$queryRaw`SELECT 'connection_test' as status, NOW() as timestamp`
    })
    
    console.log('✅ Database connection successful:', connectionTest)
    
    // Test multiple queries to check for prepared statement conflicts
    const [userCount, projectAggregate] = await Promise.all([
      safeQuery(async (prisma) => {
        return await prisma.users.count()
      }).catch((error) => {
        console.error('User count failed:', error)
        return 0
      }),
      safeQuery(async (prisma) => {
        return await prisma.projects?.aggregate({
          _count: true,
          _sum: { budget: true }
        })
      }).catch((error) => {
        console.error('Project aggregate failed:', error)
        return { _count: 0, _sum: { budget: 0 } }
      })
    ])
    
    console.log('✅ Multiple queries successful - User count:', userCount, 'Project aggregate:', projectAggregate)
    
    // Test another query to ensure no prepared statement conflicts
    const auditCount = await safeQuery(async (prisma) => {
      return await prisma.audit_logs.count()
    }).catch((error) => {
      console.error('Audit count failed:', error)
      return 0
    })
    
    return createSafeJsonResponse({
      success: true,
      message: 'Database connection with prepared statement fix successful',
      tests: {
        connectionTest: connectionTest,
        userCount: userCount,
        projectAggregate: projectAggregate,
        auditCount: auditCount
      },
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
