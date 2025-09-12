import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if we can connect to the database
    await prisma.$connect()
    
    // Try a simple query
    const userCount = await prisma.user.count()
    
    // Get database info
    const databaseUrl = process.env.DATABASE_URL
    const isProduction = process.env.NODE_ENV === 'production'
    const isVercel = process.env.VERCEL === '1'
    
    return NextResponse.json({
      status: 'connected',
      environment: process.env.NODE_ENV,
      isVercel,
      isProduction,
      databaseType: databaseUrl?.includes('postgresql') ? 'PostgreSQL' : 
                   databaseUrl?.includes('mysql') ? 'MySQL' : 
                   databaseUrl?.includes('file:') ? 'SQLite' : 'Unknown',
      userCount,
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    }, { status: 200 })
    
  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({
      status: 'error',
      environment: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed'
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
