import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, connectPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const connected = await connectPrisma();
    if (!connected) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to database after retries',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const result = await executeQuery(async (p) => p.$queryRaw`SELECT 1 as test`);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      test_query: result
    });
  } catch (error) {
    console.error('Database debug error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
