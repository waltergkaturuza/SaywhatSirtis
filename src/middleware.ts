// Next.js Middleware for session activity tracking and IP validation
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { updateSessionActivity, checkSessionIdle, checkSessionAbsoluteTimeout } from '@/lib/session-manager';
import { validateIPAccess } from '@/lib/ip-security';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes (except auth)
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Get session token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (token) {
      // Get session token from cookies
      const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                          request.cookies.get('__Secure-next-auth.session-token')?.value;

      if (sessionToken) {
        // Check session idle timeout
        const isIdle = await checkSessionIdle(sessionToken);
        if (isIdle) {
          console.log('⏱️ Session idle timeout - redirecting to login');
          const response = NextResponse.redirect(new URL('/auth/signin?timeout=idle', request.url));
          response.cookies.delete('next-auth.session-token');
          response.cookies.delete('__Secure-next-auth.session-token');
          return response;
        }

        // Check absolute timeout
        const isExpired = await checkSessionAbsoluteTimeout(sessionToken);
        if (isExpired) {
          console.log('⏱️ Session absolute timeout - redirecting to login');
          const response = NextResponse.redirect(new URL('/auth/signin?timeout=absolute', request.url));
          response.cookies.delete('next-auth.session-token');
          response.cookies.delete('__Secure-next-auth.session-token');
          return response;
        }

        // Update session activity
        await updateSessionActivity(sessionToken);
      }

      // Validate IP access for authenticated users
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       request.headers.get('x-real-ip') ||
                       request.ip ||
                       'unknown';

      const ipValidation = await validateIPAccess(
        ipAddress,
        token.id as string,
        (token.roles as string[])?.[0]
      );

      if (!ipValidation.allowed) {
        console.log('🚫 IP access denied for authenticated user:', ipAddress, ipValidation.reason);
        const response = NextResponse.redirect(new URL('/auth/signin?error=ip_blocked', request.url));
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete('__Secure-next-auth.session-token');
        return response;
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Don't block request on middleware errors
  }

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
