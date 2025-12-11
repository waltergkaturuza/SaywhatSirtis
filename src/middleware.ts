// Next.js Middleware for session activity tracking and IP validation
// Note: This middleware cannot run in Edge Runtime due to Prisma/Node.js dependencies
// It will run in Node.js runtime by default
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Export runtime config to use Node.js runtime (not Edge)
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // For now, skip session/IP checks in middleware to avoid Edge Runtime issues
  // These checks are handled in API routes and auth callbacks instead
  // TODO: Move to API route middleware or use Edge-compatible alternatives
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
