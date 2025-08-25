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

    // Placeholder for leave management - integrating with Belina software
    return NextResponse.json({
      success: true,
      message: 'Leave management is handled by Belina software integration',
      data: {
        integration: 'belina',
        status: 'active',
        redirectUrl: '/hr/belina/leave'
      }
    })
  } catch (error) {
    console.error('HR Leave API Error:', error)
    return NextResponse.json(
      { error: 'Failed to access leave management' },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Leave requests are managed through Belina software' },
    { status: 501 }
  )
}
