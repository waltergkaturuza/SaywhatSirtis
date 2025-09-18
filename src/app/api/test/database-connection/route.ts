import { NextResponse } from "next/server"
import { executeQuery, connectPrisma } from '@/lib/prisma'

// Helper function to serialize BigInt values
function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  ))
}

export async function GET() {
  try {
    console.log('🔍 Starting enhanced database connection test...')
    
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL
    const nodeEnv = process.env.NODE_ENV
    const renderEnv = process.env.RENDER
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    // Log environment info
    console.log('Environment:', nodeEnv)
    console.log('Is Render:', !!renderEnv)
    console.log('DATABASE_URL exists:', !!dbUrl)
    console.log('DATABASE_URL length:', dbUrl?.length || 0)
    console.log('DIRECT_URL exists:', !!directUrl)
    console.log('NEXTAUTH_URL:', nextAuthUrl)
    
    // Show masked database URL for debugging (first 20 and last 20 chars)
    const maskedDbUrl = dbUrl ? 
      dbUrl.substring(0, 20) + '...' + dbUrl.substring(dbUrl.length - 20) : 
      'Not found'
    console.log('DATABASE_URL (masked):', maskedDbUrl)
    
    if (!dbUrl) {
      console.error('❌ DATABASE_URL not found')
      return NextResponse.json(
        { 
          success: false, 
          error: 'DATABASE_URL environment variable not found',
          environment: nodeEnv,
          isRender: !!renderEnv,
          hasDirectUrl: !!directUrl,
          nextAuthUrl: nextAuthUrl,
          availableEnvVars: Object.keys(process.env).filter(key => 
            key.includes('DATABASE') || 
            key.includes('DIRECT') || 
            key.includes('NEXTAUTH') ||
            key.includes('RENDER') ||
            key.includes('NODE_ENV')
          )
        },
        { status: 500 }
      )
    }

    console.log('🔄 Ensuring singleton Prisma connection...')
    const startTime = Date.now()
    const connected = await connectPrisma()
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Failed to establish database connection after retries',
        environment: nodeEnv,
        isRender: !!renderEnv,
        maskedDbUrl: maskedDbUrl,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    try {
      const result = await executeQuery(async (p) => {
        return p.$queryRaw`SELECT '1' as test, NOW()::text as timestamp_text, current_database() as database_name`
      })
      const connectionTime = Date.now() - startTime
      console.log(`✅ Database query successful (${connectionTime}ms)`)
      return NextResponse.json({
        success: true,
        message: 'Database connection successful (singleton)',
        connectionTime: `${connectionTime}ms`,
        environment: nodeEnv,
        isRender: !!renderEnv,
        queryResult: result,
        maskedDbUrl: maskedDbUrl,
        timestamp: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('❌ Database connection/query failed:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          errorName: dbError instanceof Error ? dbError.name : 'Unknown',
          environment: nodeEnv,
          isRender: !!renderEnv,
          maskedDbUrl: maskedDbUrl,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ Connection test initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
