import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

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

    // Initialize Prisma with explicit configuration
    console.log('🔄 Initializing Prisma client with enhanced configuration...')
    const prisma = new PrismaClient({
      log: ['error', 'warn', 'info', 'query'],
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    // Test basic connection with timeout
    console.log('🔄 Testing database connection...')
    const startTime = Date.now()
    
    try {
      // Connect explicitly
      await prisma.$connect()
      console.log('✅ Prisma client connected')
      
      // Simple query to test connection
      const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp, current_database() as database_name`
      const connectionTime = Date.now() - startTime
      
      console.log(`✅ Database query successful (${connectionTime}ms)`)
      console.log('Query result:', result)
      
      // Test if we can access tables (optional)
      let tableCheck = null
      try {
        const tableCount = await prisma.$queryRaw`
          SELECT COUNT(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `
        tableCheck = tableCount
        console.log('✅ Table access successful:', tableCount)
      } catch (tableError) {
        console.log('⚠️ Table access failed (may be normal):', tableError)
        tableCheck = { error: 'Could not access table information' }
      }
      
      await prisma.$disconnect()
      console.log('✅ Database connection test completed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        connectionTime: `${connectionTime}ms`,
        environment: nodeEnv,
        isRender: !!renderEnv,
        queryResult: result,
        tableCheck: tableCheck,
        maskedDbUrl: maskedDbUrl,
        timestamp: new Date().toISOString()
      })
      
    } catch (dbError) {
      console.error('❌ Database connection/query failed:', dbError)
      await prisma.$disconnect()
      
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error',
          errorName: dbError instanceof Error ? dbError.name : 'Unknown',
          stack: dbError instanceof Error ? dbError.stack : 'No stack trace',
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
        stack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
