import { NextResponse } from 'next/server'

// Simple test endpoint to bypass complex authentication and database queries
export async function GET() {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'Simple HR employees test endpoint working',
      timestamp: new Date().toISOString(),
      mock_employees: [
        {
          id: 'test-1',
          firstName: 'Test',
          lastName: 'Employee',
          email: 'test@example.com',
          department: 'Test Department'
        }
      ]
    });
  } catch (error) {
    console.error('Simple HR employees test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Simple HR employees test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'Simple HR employees POST test working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple HR employees POST test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Simple HR employees POST test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}