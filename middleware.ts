import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define protected routes and their required roles
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/users': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/roles': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/database': ['SUPER_ADMIN'],
  '/admin/settings': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/audit': ['SUPER_ADMIN', 'ADMIN'],
  '/hr/employees/manage': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
  '/hr/performance': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
  '/hr/training': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
  '/hr/analytics': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
  '/programs/new': ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'],
  '/inventory': ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'],
  '/call-centre/analytics': ['SUPER_ADMIN', 'ADMIN', 'CALL_CENTRE_AGENT'],
  '/settings': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER']
}

// API routes that require specific roles
const PROTECTED_API_ROUTES: Record<string, string[]> = {
  '/api/admin': ['SUPER_ADMIN', 'ADMIN'],
  '/api/hr/employees/manage': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
  '/api/hr/performance': ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'],
  '/api/programs/projects': ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'],
  '/api/inventory': ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'],
  '/api/call-centre/analytics': ['SUPER_ADMIN', 'ADMIN', 'CALL_CENTRE_AGENT']
}

// Role hierarchy for access control
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 7,
  ADMIN: 6,
  HR_MANAGER: 5,
  PROJECT_MANAGER: 4,
  CALL_CENTRE_AGENT: 3,
  EMPLOYEE: 2,
  USER: 1
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const { pathname } = request.nextUrl

  // Allow public routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users
  if (!token) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(url)
  }

  const userRoles = (token.roles as string[]) || []
  const primaryRole = userRoles[0] || 'USER'
  const userHierarchy = ROLE_HIERARCHY[primaryRole] || 0

  // Check if user has admin role for admin access
  const isAdmin = userRoles.includes('admin') || primaryRole === 'SUPER_ADMIN' || primaryRole === 'ADMIN'

  // Check API route protection
  for (const [route, requiredRoles] of Object.entries(PROTECTED_API_ROUTES)) {
    if (pathname.startsWith(route)) {
      const hasAccess = requiredRoles.some(role => {
        const requiredHierarchy = ROLE_HIERARCHY[role] || 0
        return userHierarchy >= requiredHierarchy || userRoles.includes(role.toLowerCase()) || 
               (isAdmin && ['ADMIN', 'SUPER_ADMIN'].includes(role))
      })

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Insufficient permissions', requiredRoles },
          { status: 403 }
        )
      }
      break
    }
  }

  // Check page route protection
  for (const [route, requiredRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const hasAccess = requiredRoles.some(role => {
        const requiredHierarchy = ROLE_HIERARCHY[role] || 0
        return userHierarchy >= requiredHierarchy || userRoles.includes(role.toLowerCase()) ||
               (isAdmin && ['ADMIN', 'SUPER_ADMIN'].includes(role))
      })

      if (!hasAccess) {
        const url = new URL('/unauthorized', request.url)
        url.searchParams.set('required', requiredRoles.join(','))
        url.searchParams.set('current', primaryRole)
        return NextResponse.redirect(url)
      }
      break
    }
  }

  // Add role information to response headers for debugging
  const response = NextResponse.next()
  response.headers.set('X-User-Role', primaryRole)
  response.headers.set('X-User-Roles', userRoles.join(','))
  response.headers.set('X-User-Hierarchy', userHierarchy.toString())

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
