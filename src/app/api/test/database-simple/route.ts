import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

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

    // Initialize Prisma
    console.log('🔄 Initializing Prisma client...')
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    console.log('🔄 Testing database connection...')
    const startTime = Date.now()
    
    try {
      // Simple connection test without BigInt issues
      await prisma.$connect()
      console.log('✅ Prisma client connected')
      
      // Very simple query that won't produce BigInt
      await prisma.$queryRaw`SELECT 'connection_test' as status`
      const connectionTime = Date.now() - startTime
      
      console.log(`✅ Database connection successful (${connectionTime}ms)`)
      
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        connectionTime: `${connectionTime}ms`,
        environment: nodeEnv,
        isRender: !!renderEnv,
        timestamp: new Date().toISOString()
      })
      
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      await prisma.$disconnect()
      
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
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
