import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db-connection';

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseConnection();
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      message: 'SIRTIS API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        connected: dbHealthy,
        url: process.env.DATABASE_URL ? 'configured' : 'missing'
      },
      environment: {
        node_env: process.env.NODE_ENV,
        port: process.env.PORT || 'not set',
        nextauth_url: process.env.NEXTAUTH_URL ? 'configured' : 'missing'
      }
    };

    // Return 503 if unhealthy for proper health check failure
    return NextResponse.json(health, { 
      status: dbHealthy ? 200 : 503 
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
