import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    message: 'SIRTIS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
