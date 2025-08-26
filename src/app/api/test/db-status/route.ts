import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('DB Status: Starting database connection test...')
    
    // Test database connection
    await prisma.$connect()
    console.log('DB Status: Database connected successfully')
    
    // Test basic query
    const userCount = await prisma.user.count()
    console.log(`DB Status: Found ${userCount} users`)
    
    const documentCount = await prisma.document.count()
    console.log(`DB Status: Found ${documentCount} documents`)
    
    const eventCount = await prisma.event.count()
    console.log(`DB Status: Found ${eventCount} events`)
    
    // Test database info
    const result = await prisma.$queryRaw`SELECT version()` as any[]
    const dbVersion = result[0]?.version || 'Unknown'
    
    return NextResponse.json({
      status: 'connected',
      database: {
        version: dbVersion,
        url: process.env.DATABASE_URL ? '✓ Configured' : '✗ Missing',
        directUrl: process.env.DIRECT_URL ? '✓ Configured' : '✗ Missing'
      },
      counts: {
        users: userCount,
        documents: documentCount,
        events: eventCount
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('DB Status: Database connection failed:', error)
    
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      database: {
        url: process.env.DATABASE_URL ? '✓ Configured' : '✗ Missing',
        directUrl: process.env.DIRECT_URL ? '✓ Configured' : '✗ Missing'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
