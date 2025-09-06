import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envDebug = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'Not set',
      directUrl: process.env.DIRECT_URL ? process.env.DIRECT_URL.substring(0, 50) + '...' : 'Not set',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasDatabase: !!process.env.DATABASE_URL,
      hasDirect: !!process.env.DIRECT_URL,
      usingPooler: process.env.DATABASE_URL?.includes(':6543') || false,
      usingDirect: process.env.DIRECT_URL?.includes(':5432') || false
    }

    return NextResponse.json({
      success: true,
      environment: envDebug,
      recommendation: envDebug.usingPooler ? 
        'Update DATABASE_URL to use port 5432 (direct connection) instead of port 6543 (pooler)' :
        'Database configuration looks correct'
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check environment' 
    }, { status: 500 })
  }
}
