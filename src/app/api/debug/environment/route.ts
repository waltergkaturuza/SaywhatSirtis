import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const originalUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL
    
    // Convert pooler URL to direct connection URL automatically
    let convertedUrl = directUrl || originalUrl
    let wasConverted = false
    
    if (convertedUrl && convertedUrl.includes(':6543') && convertedUrl.includes('pooler.supabase.com')) {
      const oldUrl = convertedUrl
      convertedUrl = convertedUrl
        .replace(':6543', ':5432')
        .replace('pooler.supabase.com', 'compute.amazonaws.com')
      wasConverted = true
    }

    const envDebug = {
      nodeEnv: process.env.NODE_ENV,
      originalDatabaseUrl: originalUrl ? originalUrl.substring(0, 50) + '...' : 'Not set',
      directUrl: directUrl ? directUrl.substring(0, 50) + '...' : 'Not set',
      convertedUrl: convertedUrl ? convertedUrl.substring(0, 50) + '...' : 'Not set',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasDatabase: !!originalUrl,
      hasDirect: !!directUrl,
      wasAutoConverted: wasConverted,
      usingPooler: originalUrl?.includes(':6543') || false,
      finallyUsingDirect: convertedUrl?.includes(':5432') || false
    }

    return NextResponse.json({
      success: true,
      environment: envDebug,
      status: wasConverted ? 
        '✅ Automatically converted pooler URL to direct connection' :
        envDebug.finallyUsingDirect ? 
          '✅ Using direct connection' : 
          '❌ Still using pooler connection',
      recommendation: envDebug.finallyUsingDirect ? 
        'Database configuration is now correct' :
        'Unable to convert to direct connection'
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check environment' 
    }, { status: 500 })
  }
}
