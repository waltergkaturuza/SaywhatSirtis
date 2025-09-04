import { NextResponse } from "next/server"

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL
    
    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Try to parse the URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(dbUrl)
    } catch (urlError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid DATABASE_URL format',
        details: urlError instanceof Error ? urlError.message : 'Unknown URL error',
        dbUrlPreview: dbUrl.substring(0, 30) + '...',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Extract connection details
    const connectionInfo = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: parsedUrl.pathname,
      searchParams: Object.fromEntries(parsedUrl.searchParams)
    }

    // Test using Node.js pg library (if available) or raw TCP connection
    try {
      // For this test, we'll use fetch to test if we can reach the hostname
      const hostTest = await fetch(`https://${parsedUrl.hostname}`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }).catch(error => ({ error: error.message }))

      return NextResponse.json({
        success: true,
        message: 'Database URL parsing successful',
        connectionInfo,
        hostTest: hostTest instanceof Response ? 'Host reachable' : hostTest,
        timestamp: new Date().toISOString()
      })

    } catch (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        details: connectionError instanceof Error ? connectionError.message : 'Unknown connection error',
        connectionInfo,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
