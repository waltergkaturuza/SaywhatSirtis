import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Session Debug Info:')
    console.log('Session exists:', !!session)
    console.log('Session user:', JSON.stringify(session?.user, null, 2))
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: 'No session found'
      }, { status: 401 })
    }

    // Check what permissions the user actually has
    const userPermissions = session.user?.permissions || []
    const userRoles = session.user?.roles || []
    
    console.log('User permissions:', userPermissions)
    console.log('User roles:', userRoles)
    
    // Check HR permissions specifically
    const hasHRView = userPermissions.includes('hr.view')
    const hasHRFullAccess = userPermissions.includes('hr.full_access')
    const isAdmin = userRoles.includes('admin')
    const isHRManager = userRoles.includes('hr_manager')
    
    console.log('HR Permission Check:')
    console.log('- hr.view:', hasHRView)
    console.log('- hr.full_access:', hasHRFullAccess)
    console.log('- admin role:', isAdmin)
    console.log('- hr_manager role:', isHRManager)
    
    const hasPermission = hasHRView || hasHRFullAccess || isAdmin || isHRManager
    
    return NextResponse.json({
      success: true,
      session: {
        user: session.user
      },
      permissions: {
        hasHRView,
        hasHRFullAccess,
        isAdmin,
        isHRManager,
        hasPermission,
        allPermissions: userPermissions,
        allRoles: userRoles
      }
    })
    
  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
