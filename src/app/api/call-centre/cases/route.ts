import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre cases API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Harmonized permission logic with other call centre endpoints
    const hasPermission = session.user.permissions?.includes('calls.view') ||
      session.user.permissions?.includes('calls.full_access') ||
      session.user.roles?.includes('admin') ||
      session.user.roles?.includes('manager');

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get call centre records from database with timeout and error handling
    let calls: any[] = [];
    
    try {
      const queryPromise = Promise.race([
        prisma.call_records.findMany({
          where: {
            // Only include calls that have been assigned to create cases
            assignedOfficer: {
              not: null
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100 // Limit results to prevent timeout
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cases query timeout')), 10000)
        )
      ]);
      
      calls = await queryPromise as any[];
    } catch (error) {
      console.error('Failed to fetch call records for cases:', error);
      // Return empty cases array if database query fails
      return NextResponse.json({
        success: true,
        cases: [],
        error: 'Database query failed, showing empty results'
      });
    }

    // Transform calls into cases format
    const cases = calls.map(call => {
      const now = new Date();
      const createdDate = new Date(call.createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + 7); // Default 7 days from creation
      
      return {
        id: call.id,
        caseNumber: `CASE-${call.id.substring(0, 8)}`,
        callNumber: call.callNumber || call.id,
        clientName: call.callerName,
        phone: call.callerPhone,
        purpose: call.summary || 'General Inquiry',
        officer: call.assignedOfficer,
        status: (call.status || 'OPEN').toLowerCase().replace('_', '-'),
        priority: (call.priority || 'MEDIUM').toLowerCase(),
        createdDate: createdDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        lastUpdate: call.updatedAt.toISOString().split('T')[0],
        isOverdue: now > dueDate && call.status !== 'CLOSED',
        description: call.notes || 'No description available'
      };
    });

    return NextResponse.json({
      success: true,
      cases: cases
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases', details: error instanceof Error ? { name: error.name, message: error.message } : 'Unknown error' },
      { status: 500 }
    );
  }
}
