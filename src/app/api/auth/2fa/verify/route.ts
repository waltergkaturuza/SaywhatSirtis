// 2FA Verification API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyTwoFactorToken, enableTwoFactor, getUserTwoFactorSecret } from '@/lib/two-factor-auth';
import { createErrorResponse, createAuthError, createValidationError } from '@/lib/error-handler';
import AuditLogger from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return createErrorResponse(createAuthError(), request.url);
    }

    const body = await request.json();
    const { token, secret, backupCodes } = body;

    if (!token) {
      return createErrorResponse(
        createValidationError('2FA token is required', 'token'),
        request.url
      );
    }

    // Verify token
    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
      // Log failed verification attempt
      await AuditLogger.logSecurityEvent(
        '2FA_VERIFICATION_FAILED',
        {
          userId: session.user.id,
          email: session.user.email,
          timestamp: new Date().toISOString()
        },
        session.user.id,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ).catch(err => console.error('Failed to log 2FA verification:', err));

      return NextResponse.json({
        success: false,
        error: 'Invalid 2FA token. Please try again.'
      }, { status: 400 });
    }

    // Enable 2FA for user
    if (backupCodes && Array.isArray(backupCodes)) {
      await enableTwoFactor(session.user.id, secret, backupCodes);
    }

    // Log successful 2FA enablement
    await AuditLogger.logSecurityEvent(
      '2FA_ENABLED',
      {
        userId: session.user.id,
        email: session.user.email,
        timestamp: new Date().toISOString()
      },
      session.user.id,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    ).catch(err => console.error('Failed to log 2FA enablement:', err));

    return NextResponse.json({
      success: true,
      message: '2FA has been enabled successfully. You will be required to provide a 2FA code on future logins.'
    });
  } catch (error) {
    return createErrorResponse(error, request.url);
  }
}

