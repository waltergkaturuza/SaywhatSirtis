import { NextRequest, NextResponse } from 'next/server';

// Simple health check that doesn't require database connection
// This is a backup endpoint for Render's health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'SIRTIS API is running (simple check)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    port: process.env.PORT || 'not set',
    simple: true
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}