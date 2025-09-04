import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get all environment variables that might be relevant
    const relevantEnvVars = Object.keys(process.env)
      .filter(key => {
        const lowerKey = key.toLowerCase()
        return (
          lowerKey.includes('database') ||
          lowerKey.includes('direct') ||
          lowerKey.includes('nextauth') ||
          lowerKey.includes('render') ||
          lowerKey.includes('node_env') ||
          lowerKey.includes('port') ||
          lowerKey.includes('url')
        )
      })
      .reduce((acc, key) => {
        // Mask sensitive values
        let value = process.env[key]
        if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
          value = value ? '***MASKED***' : 'Not set'
        } else if (key.includes('URL') && value && value.length > 50) {
          // Show first and last parts of URLs
          value = value.substring(0, 20) + '...' + value.substring(value.length - 20)
        }
        acc[key] = value || 'Not set'
        return acc
      }, {} as Record<string, string>)

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      isRender: !!process.env.RENDER,
      port: process.env.PORT,
      relevantEnvVars,
      totalEnvVars: Object.keys(process.env).length,
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
