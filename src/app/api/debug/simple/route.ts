import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple response without any dependencies
    return NextResponse.json({
      status: 'success',
      message: 'Simple debug endpoint working',
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
      has_database_url: !!process.env.DATABASE_URL,
      has_nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      request_headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    console.error('Simple debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Simple debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    return NextResponse.json({
      status: 'success',
      message: 'POST to simple debug endpoint working',
      timestamp: new Date().toISOString(),
      received_body: body,
      content_type: request.headers.get('content-type')
    });
  } catch (error) {
    console.error('Simple debug POST error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'POST to simple debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}