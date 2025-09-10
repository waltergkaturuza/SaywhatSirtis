import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !session.user.roles?.includes('ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return user permissions for testing
    return NextResponse.json({ 
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        roles: session.user.roles,
        permissions: session.user.permissions
      }
    })

  } catch (error) {
    console.error('Permissions test error:', error)
    return NextResponse.json(
      { error: 'Permission test failed' },
      { status: 500 }
    )
  }
}