import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has call centre access
    if (!session.user.permissions?.includes('callcentre.access')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get call centre records from database and transform them into cases
    const calls = await prisma.call_records.findMany({
      where: {
        // Only include calls that have been assigned to create cases
        assignedOfficer: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform calls into cases format
    const cases = calls.map(call => {
      const now = new Date();
      const createdDate = new Date(call.createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + 7); // Default 7 days from creation
      
      return {
        id: call.id,
        caseNumber: `CASE-${call.id.substring(0, 8)}`,
        callNumber: call.id,
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
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}
