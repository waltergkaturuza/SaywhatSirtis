import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('id')

    // If ID is provided, fetch single case
    if (caseId) {
      const call = await prisma.callRecord.findUnique({
        where: { id: caseId }
      })

      if (!call) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
      }

      // Transform to detailed case format
      const caseData = {
        id: call.id,
        caseNumber: call.caseNumber || `CASE-${call.id.substring(0, 8)}`,
        callNumber: call.caseNumber || call.id,
        
        // Basic information
        clientName: call.callerName || 'Unknown',
        phone: call.callerPhone || '',
        email: (call as any).callerEmail || '',
        purpose: (call as any).purpose || call.subject || 'General Inquiry',
        officer: call.assignedOfficer || 'Unassigned',
        status: (call.status || 'OPEN').toLowerCase().replace('_', '-'),
        priority: ((call as any).priority || call.priority || 'MEDIUM').toLowerCase(),
        
        // Dates
        createdDate: call.createdAt.toISOString().split('T')[0],
        dueDate: call.followUpDate?.toISOString().split('T')[0] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastUpdate: call.updatedAt?.toISOString().split('T')[0] || call.createdAt.toISOString().split('T')[0],
        isOverdue: call.followUpDate ? new Date(call.followUpDate) < new Date() : false,
        
        // Content
        description: call.description || call.notes || 'No description available',
        summary: (call as any).summary || call.summary || '',
        resolution: (call as any).resolution || '',
        
        // Enhanced details
        category: (call as any).category || 'INQUIRY',
        satisfactionRating: (call as any).satisfactionRating || null,
        followUpRequired: call.followUpRequired || false,
        followUpDate: call.followUpDate?.toISOString(),
        followUpNotes: (call as any).followUpNotes || '',
        
        // Client details
        callerAge: (call as any).callerAge || '',
        callerGender: (call as any).callerGender || '',
        callerProvince: (call as any).callerProvince || '',
        callerAddress: (call as any).callerAddress || '',
        district: (call as any).district || '',
        ward: (call as any).ward || '',
        
        // Service information
        servicesRecommended: (call as any).servicesRecommended || '',
        referrals: (call as any).referral || (call as any).referralDetails || '',
        voucherIssued: (call as any).voucherIssued || 'no',
        voucherValue: (call as any).voucherValue || '',
        additionalNotes: (call as any).additionalNotes || call.notes || ''
      }

      return NextResponse.json(caseData)
    }

    // Get all call centre records from database and transform them into cases
    const calls = await prisma.callRecord.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform calls into cases format
    const cases = calls.map(call => {
      const now = new Date();
      const createdDate = new Date(call.createdAt);
      const dueDate = call.followUpDate ? new Date(call.followUpDate) : new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days from creation
      
      return {
        id: call.id,
        caseNumber: call.caseNumber || `CASE-${call.id.substring(0, 8)}`,
        callNumber: call.caseNumber || call.id,
        clientName: call.callerName || 'Unknown',
        phone: call.callerPhone || '',
        purpose: (call as any).purpose || call.subject || 'General Inquiry',
        officer: call.assignedOfficer || 'Unassigned',
        status: (call.status || 'OPEN').toLowerCase().replace('_', '-'),
        priority: ((call as any).priority || call.priority || 'MEDIUM').toLowerCase(),
        createdDate: createdDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        lastUpdate: call.updatedAt?.toISOString().split('T')[0] || call.createdAt.toISOString().split('T')[0],
        isOverdue: now > dueDate && call.status !== 'CLOSED',
        description: call.description || call.notes || 'No description available',
        category: (call as any).category || 'INQUIRY',
        email: (call as any).callerEmail || ''
      };
    });

    return NextResponse.json({
      success: true,
      cases: cases,
      total: cases.length
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

// Update case status or information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (!session.user.permissions?.includes('callcentre.access')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('id')
    
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 })
    }

    const data = await request.json()

    // Prepare update data with comprehensive field mapping
    const updateData: any = {
      updatedAt: new Date()
    }

    // Basic case information
    if (data.status !== undefined) updateData.status = data.status
    if (data.officer !== undefined) updateData.assignedOfficer = data.officer
    if (data.assignedOfficer !== undefined) updateData.assignedOfficer = data.assignedOfficer
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.category !== undefined) updateData.category = data.category
    if (data.caseType !== undefined) updateData.category = data.caseType

    // Client information updates
    if (data.clientName !== undefined) updateData.clientName = data.clientName
    if (data.clientPhone !== undefined) updateData.clientPhone = data.clientPhone
    if (data.clientAge !== undefined) updateData.clientAge = data.clientAge
    if (data.clientGender !== undefined) updateData.clientGender = data.clientGender
    if (data.clientProvince !== undefined) updateData.clientProvince = data.clientProvince
    if (data.clientAddress !== undefined) updateData.clientAddress = data.clientAddress

    // Call/Case details
    if (data.callPurpose !== undefined) updateData.subject = data.callPurpose
    if (data.description !== undefined) updateData.description = data.description
    if (data.summary !== undefined) updateData.summary = data.summary

    // Follow-up and resolution
    if (data.followUpDate !== undefined) {
      updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null
    }
    if (data.followUpRequired !== undefined) updateData.followUpRequired = data.followUpRequired
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.resolution !== undefined) updateData.resolution = data.resolution

    // Additional tracking fields
    if (data.actionsTaken !== undefined) updateData.actionsTaken = data.actionsTaken
    if (data.nextAction !== undefined) updateData.nextAction = data.nextAction
    if (data.referrals !== undefined) updateData.referralDetails = data.referrals
    if (data.outcome !== undefined) updateData.callOutcome = data.outcome

    // Update the call record with comprehensive case updates
    const updatedCall = await prisma.callRecord.update({
      where: { id: caseId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Case updated successfully',
      case: {
        id: updatedCall.id,
        status: updatedCall.status,
        officer: updatedCall.assignedOfficer,
        lastUpdate: updatedCall.updatedAt?.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}
