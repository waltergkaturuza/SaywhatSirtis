// 2FA Setup API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setupTwoFactor } from '@/lib/two-factor-auth';
import { createErrorResponse, createAuthError } from '@/lib/error-handler';
import AuditLogger from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return createErrorResponse(createAuthError(), request.url);
    }

    // Check if user is admin or has permission to enable 2FA
    const isAdmin = session.user.roles?.some(role => 
      ['admin', 'SYSTEM_ADMINISTRATOR'].includes(role.toUpperCase())
    ) || session.user.email?.includes('admin');

    if (!isAdmin) {
      return createErrorResponse(
        new Error('2FA is currently only available for administrator accounts'),
        request.url
      );
    }

    // Setup 2FA
    const twoFactorSetup = await setupTwoFactor(session.user.id, session.user.email);

    // Log 2FA setup initiation
    await AuditLogger.logSecurityEvent(
      '2FA_SETUP_INITIATED',
      {
        userId: session.user.id,
        email: session.user.email,
        timestamp: new Date().toISOString()
      },
      session.user.id,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    ).catch(err => console.error('Failed to log 2FA setup:', err));

    return NextResponse.json({
      success: true,
      data: {
        secret: twoFactorSetup.secret,
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        backupCodes: twoFactorSetup.backupCodes,
        message: 'Save your backup codes in a secure location. You will need to verify with a code to enable 2FA.'
      }
    });
  } catch (error) {
    return createErrorResponse(error, request.url);
  }
}

