import { NextResponse } from "next/server"

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL
    
    // Check if database URL has the right format
    const dbUrlInfo = {
      exists: !!dbUrl,
      length: dbUrl?.length || 0,
      startsWith: dbUrl ? {
        postgres: dbUrl.startsWith('postgres://'),
        postgresql: dbUrl.startsWith('postgresql://'),
        prisma: dbUrl.startsWith('prisma+postgres://'),
      } : null,
      containsPooler: dbUrl ? dbUrl.includes('pooler.supabase.com') : false,
      containsPort: dbUrl ? dbUrl.includes(':6543') : false,
      containsSSL: dbUrl ? dbUrl.includes('sslmode=require') : false,
    }

    const directUrlInfo = {
      exists: !!directUrl,
      length: directUrl?.length || 0,
      startsWith: directUrl ? {
        postgres: directUrl.startsWith('postgres://'),
        postgresql: directUrl.startsWith('postgresql://'),
        prisma: directUrl.startsWith('prisma+postgres://'),
      } : null,
    }

    return NextResponse.json({
      success: true,
      databaseUrl: dbUrlInfo,
      directUrl: directUrlInfo,
      environment: process.env.NODE_ENV,
      isRender: !!process.env.RENDER,
      supabaseUrl: process.env.SUPABASE_URL,
      // Show a bit more of the URL for debugging (safely)
      dbUrlPreview: dbUrl ? 
        dbUrl.substring(0, 50) + '...' + dbUrl.substring(dbUrl.length - 30) : 
        'Not found',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
