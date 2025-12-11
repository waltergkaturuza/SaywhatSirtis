// 2FA Status API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isTwoFactorEnabled } from '@/lib/two-factor-auth';
import { createErrorResponse, createAuthError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse(createAuthError(), request.url);
    }

    const enabled = await isTwoFactorEnabled(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        enabled,
        required: session.user.roles?.some(role => 
          ['admin', 'SYSTEM_ADMINISTRATOR'].includes(role.toUpperCase())
        ) || false
      }
    });
  } catch (error) {
    return createErrorResponse(error, request.url);
  }
}

