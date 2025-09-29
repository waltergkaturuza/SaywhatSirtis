import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      PORT: process.env.PORT || 'NOT SET',
      // Hide sensitive values but show if they're set
    }

    return NextResponse.json({
      success: true,
      environment: envVars,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check environment variables',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}