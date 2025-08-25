import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Placeholder for leave reports - integrating with Belina software
    return NextResponse.json({
      success: true,
      message: 'Leave reports are handled by Belina software integration',
      data: {
        integration: 'belina',
        status: 'active',
        redirectUrl: '/hr/belina/leave/reports'
      }
    })
  } catch (error) {
    console.error('HR Leave Reports API Error:', error)
    return NextResponse.json(
      { error: 'Failed to access leave reports' },
      { status: 500 }
    )
  }
}
