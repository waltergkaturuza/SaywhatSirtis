import { NextResponse } from "next/server"
import { executeQuery, connectPrisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Starting simple database connection test...')
    
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL
    const nodeEnv = process.env.NODE_ENV
    const renderEnv = process.env.RENDER
    
    console.log('Environment:', nodeEnv)
    console.log('Is Render:', !!renderEnv)
    console.log('DATABASE_URL exists:', !!dbUrl)
    
    if (!dbUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'DATABASE_URL environment variable not found',
          environment: nodeEnv,
          isRender: !!renderEnv
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
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    try {
      await executeQuery(async (p) => {
        await p.$queryRaw`SELECT 'connection_test' as status`
      })
      const connectionTime = Date.now() - startTime
      return NextResponse.json({
        success: true,
        message: 'Database connection successful (singleton)',
        connectionTime: `${connectionTime}ms`,
        environment: nodeEnv,
        isRender: !!renderEnv,
        timestamp: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('❌ Database verification failed:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Database query failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          environment: nodeEnv,
          isRender: !!renderEnv,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ Connection test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
