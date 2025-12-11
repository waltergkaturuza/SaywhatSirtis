// Session Management API
// GET: List all active sessions for current user
// DELETE: Revoke a specific session or all sessions

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserSessions, revokeSession, revokeAllSessions } from '@/lib/session-manager';
import { getClientIP } from '@/lib/production-helpers';
import { createErrorResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', request.url);
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value || '';

    const sessions = await getUserSessions(session.user.id, sessionToken);

    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return createErrorResponse(error, request.url);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', request.url);
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('revokeAll') === 'true';

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const currentSessionToken = request.cookies.get('next-auth.session-token')?.value || 
                               request.cookies.get('__Secure-next-auth.session-token')?.value || '';

    if (revokeAll) {
      const revokedCount = await revokeAllSessions(
        session.user.id,
        currentSessionToken,
        ipAddress,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: `Revoked ${revokedCount} session(s)`,
        revokedCount
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const revoked = await revokeSession(
      sessionId,
      session.user.id,
      session.user.id,
      ipAddress,
      userAgent
    );

    if (!revoked) {
      return NextResponse.json(
        { success: false, error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking session:', error);
    return createErrorResponse(error, request.url);
  }
}

