import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    // Try to find the call record by ID or case number
    let call = await prisma.callRecord.findFirst({
      where: {
        OR: [
          { id: caseId },
          { id: { contains: caseId.replace('CASE-', '') } }
        ]
      }
    }).catch(() => null);

    if (!call) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Transform call into case format
    const now = new Date();
    const createdDate = new Date(call.createdAt);
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + 7); // Default 7 days from creation

    const caseData = {
      id: call.id,
      caseNumber: `CASE-${call.id.substring(0, 8)}`,
      callNumber: call.id,
      status: (call.status || 'Open').replace('_', ' '),
      priority: call.priority || 'Medium',
      createdDate: createdDate.toISOString().split('T')[0],
      lastUpdated: call.updatedAt.toISOString().split('T')[0],
      assignedOfficer: call.assignedOfficer || 'Unassigned',
      clientName: call.callerName || 'Unknown',
      clientPhone: call.callerPhone || 'N/A',
      clientAge: 'N/A', // Not available in CallRecord model
      clientGender: 'N/A', // Not available in CallRecord model
      clientProvince: call.district || 'N/A',
      clientAddress: `${call.ward || ''} ${call.district || ''}`.trim() || 'N/A',
      callPurpose: call.subject || 'General Inquiry',
      caseType: call.category || 'General',
      description: call.description || 'No description available',
      actionsTaken: call.notes || 'No actions recorded',
      nextAction: call.resolution || 'Pending review',
      referrals: 'N/A', // Not available in CallRecord model
      notes: call.notes || 'No additional notes',
      followUpDate: call.followUpDate ? call.followUpDate.toISOString().split('T')[0] : null,
      resolution: call.resolution || '',
      outcome: call.status === 'RESOLVED' ? 'Resolved' : 'Pending'
    };

    return NextResponse.json({
      success: true,
      case: caseData
    });

  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
    const body = await request.json();

    // Find the call record
    let call = await prisma.callRecord.findFirst({
      where: {
        OR: [
          { id: caseId },
          { id: { contains: caseId.replace('CASE-', '') } }
        ]
      }
    }).catch(() => null);

    if (!call) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Update the call record
    const updatedCall = await prisma.callRecord.update({
      where: { id: call.id },
      data: {
        callerName: body.clientName,
        callerPhone: body.clientPhone,
        subject: body.callPurpose,
        category: body.caseType,
        description: body.description,
        notes: body.actionsTaken,
        resolution: body.nextAction,
        status: body.status?.toUpperCase().replace(' ', '_'),
        priority: body.priority?.toUpperCase(),
        assignedOfficer: body.assignedOfficer,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Case updated successfully',
      case: updatedCall
    });

  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}
