// IP Rules Management API (Admin Only)
// GET: List all IP rules
// POST: Add IP to whitelist or blacklist
// DELETE: Remove IP rule

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllIPRules, addToWhitelist, addToBlacklist, removeIPRule } from '@/lib/ip-security';
import { getClientIP } from '@/lib/production-helpers';
import { createErrorResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', request.url);
    }

    // Check admin permissions
    const isAdmin = session.user.roles?.includes('SYSTEM_ADMINISTRATOR') || 
                   session.user.roles?.includes('ADMIN') ||
                   session.user.role === 'SYSTEM_ADMINISTRATOR';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'whitelist' | 'blacklist' | undefined;
    const userId = searchParams.get('userId') || undefined;

    const rules = await getAllIPRules(type, userId);

    return NextResponse.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('Error fetching IP rules:', error);
    return createErrorResponse(error, request.url);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', request.url);
    }

    // Check admin permissions
    const isAdmin = session.user.roles?.includes('SYSTEM_ADMINISTRATOR') || 
                   session.user.roles?.includes('ADMIN') ||
                   session.user.role === 'SYSTEM_ADMINISTRATOR';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ipAddress, type, userId, role, reason, expiresAt } = body;

    if (!ipAddress || !type || !['whitelist', 'blacklist'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. ipAddress and type (whitelist/blacklist) are required.' },
        { status: 400 }
      );
    }

    const ipAddressReq = getClientIP(request);

    if (type === 'whitelist') {
      await addToWhitelist(
        ipAddress,
        userId,
        role,
        reason,
        expiresAt ? new Date(expiresAt) : undefined,
        session.user.id
      );
    } else {
      await addToBlacklist(
        ipAddress,
        reason || 'Manual blacklist',
        expiresAt ? new Date(expiresAt) : undefined,
        session.user.id
      );
    }

    return NextResponse.json({
      success: true,
      message: `IP ${ipAddress} added to ${type} successfully`
    });
  } catch (error) {
    console.error('Error adding IP rule:', error);
    return createErrorResponse(error, request.url);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', request.url);
    }

    // Check admin permissions
    const isAdmin = session.user.roles?.includes('SYSTEM_ADMINISTRATOR') || 
                   session.user.roles?.includes('ADMIN') ||
                   session.user.role === 'SYSTEM_ADMINISTRATOR';

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'ruleId is required' },
        { status: 400 }
      );
    }

    const removed = await removeIPRule(ruleId, session.user.id);

    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'IP rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'IP rule removed successfully'
    });
  } catch (error) {
    console.error('Error removing IP rule:', error);
    return createErrorResponse(error, request.url);
  }
}

