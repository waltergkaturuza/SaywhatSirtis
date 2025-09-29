import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const params = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has call centre access
    if (!session.user.permissions?.includes('callcentre.access')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const caseId = params.id;

    // Get case information first by ID or case number
    const caseRecord = await prisma.call_records.findFirst({
      where: {
        OR: [
          { id: caseId },
          { caseNumber: caseId }
        ]
      },
      select: {
        id: true,
        caseNumber: true,
        callerName: true,
        status: true,
        createdAt: true
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Get audit history for this case using the actual database ID
    const auditHistory = await prisma.audit_logs.findMany({
      where: {
        resource: 'CASE',
        resourceId: caseRecord.id  // Use the actual database ID
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Transform history data for frontend display
    const historyEntries = auditHistory.map(entry => {
      const details = entry.details as any;
      return {
        id: entry.id,
        timestamp: entry.timestamp,
        action: entry.action,
        user: {
          name: entry.users ? `${entry.users.firstName || ''} ${entry.users.lastName || ''}`.trim() || entry.users.email : 'Unknown User',
          email: entry.users?.email
        },
        changes: details?.changes || {},
        changeCount: details?.changeCount || 0,
        reason: details?.reason || 'No reason provided',
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent
      };
    });

    return NextResponse.json({
      success: true,
      case: {
        id: caseRecord.id,
        caseNumber: caseRecord.caseNumber,
        callerName: caseRecord.callerName,
        status: caseRecord.status,
        createdAt: caseRecord.createdAt
      },
      history: historyEntries,
      totalEntries: historyEntries.length
    });

  } catch (error) {
    console.error('Error fetching case history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case history' },
      { status: 500 }
    );
  }
}