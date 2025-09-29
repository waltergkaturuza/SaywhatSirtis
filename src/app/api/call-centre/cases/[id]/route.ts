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

    // Find call record by ID or case number
    let call = await prisma.call_records.findFirst({
      where: {
        OR: [
          { id: caseId },
          { caseNumber: caseId }
        ]
      }
    });

    if (!call) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Return actual case data from database (no transformation/mock data)
    const caseData = {
      id: call.id,
      caseNumber: call.caseNumber, // Use actual case number from database
      callNumber: call.callNumber, // Use actual call number from database
      status: call.status || 'OPEN',
      priority: call.priority || 'MEDIUM',
      // Client Information (use actual database fields)
      clientName: call.callerName || call.clientName,
      clientPhone: call.callerPhone,
      clientEmail: call.callerEmail,
      clientAge: call.callerAge,
      clientGender: call.callerGender,
      clientAddress: call.callerAddress,
      clientProvince: call.callerProvince,
      // Call Information
      callType: call.callType,
      modeOfCommunication: call.modeOfCommunication,
      callDescription: call.callDescription,
      purpose: call.purpose,
      // Case Management
      assignedOfficer: call.assignedOfficer,
      notes: call.notes,
      summary: call.summary,
      resolution: call.resolution,
      followUpRequired: call.followUpRequired,
      followUpDate: call.followUpDate,
      // Dates
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
      callStartTime: call.callStartTime,
      callEndTime: call.callEndTime,
      resolvedAt: call.resolvedAt,
      // Additional fields for frontend compatibility
      createdDate: call.createdAt.toISOString().split('T')[0],
      lastUpdated: call.updatedAt.toISOString().split('T')[0],
      callPurpose: call.subject || 'General Inquiry',
      caseType: call.category || 'General',
      description: call.description || 'No description available',
      actionsTaken: call.notes || 'No actions recorded',
      nextAction: call.resolution || 'Pending review',
      referrals: 'N/A', // Not available in CallRecord model
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
    const body = await request.json();

    // Find the call record by ID or case number
    let call = await prisma.call_records.findFirst({
      where: {
        OR: [
          { id: caseId },
          { caseNumber: caseId }
        ]
      }
    });

    if (!call) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Create detailed change tracking
    const changes: any = {};
    const unchangedFields = ['id', 'caseNumber', 'callNumber', 'createdAt']; // Fields that should never change
    
    // Track all field changes
    const fieldsToTrack = [
      'callerName', 'callerPhone', 'callerEmail', 'callerAge', 'callerGender', 
      'callerAddress', 'callerProvince', 'subject', 'category', 'description', 
      'summary', 'notes', 'resolution', 'status', 'priority', 'assignedOfficer', 
      'followUpRequired', 'followUpDate', 'callDescription', 'purpose'
    ];

    fieldsToTrack.forEach(field => {
      const newValue = body[field] || body[field.replace('caller', 'client')] || body[field.replace('subject', 'callPurpose')] || body[field.replace('category', 'caseType')];
      const oldValue = (call as any)[field];
      
      // Handle special field mappings
      let finalNewValue = newValue;
      if (field === 'status' && newValue) {
        finalNewValue = newValue.toUpperCase().replace(' ', '_');
      }
      if (field === 'priority' && newValue) {
        finalNewValue = newValue.toUpperCase();
      }
      if (field === 'followUpDate' && newValue) {
        finalNewValue = new Date(newValue);
      }
      
      // Only track actual changes
      if (finalNewValue !== undefined && finalNewValue !== oldValue && finalNewValue !== null && finalNewValue !== '') {
        changes[field] = {
          from: oldValue,
          to: finalNewValue,
          fieldLabel: field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        };
      }
    });

    // If no changes detected, return success without updating
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        case: call
      });
    }

    // Create audit log entry before updating
    const changeDetails = {
      action: 'CASE_UPDATE',
      changes: changes,
      changeCount: Object.keys(changes).length,
      caseNumber: call.caseNumber,
      reason: body.changeReason || 'Case information updated',
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    // Log the change to audit_logs
    await prisma.audit_logs.create({
      data: {
        id: require('crypto').randomUUID(),
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'CASE',
        resourceId: caseId,
        details: changeDetails,
        ipAddress: changeDetails.ipAddress,
        userAgent: changeDetails.userAgent,
        timestamp: new Date()
      }
    });

    // Update the call record with proper field mapping
    const updatedCall = await prisma.call_records.update({
      where: { id: call.id },
      data: {
        // Client Information
        callerName: body.clientName || body.callerName || call.callerName,
        callerPhone: body.clientPhone || body.callerPhone || call.callerPhone,
        callerEmail: body.clientEmail || body.callerEmail || call.callerEmail,
        callerAge: body.clientAge || body.callerAge || call.callerAge,
        callerGender: body.clientGender || body.callerGender || call.callerGender,
        callerAddress: body.clientAddress || body.callerAddress || call.callerAddress,
        callerProvince: body.clientProvince || body.callerProvince || call.callerProvince,
        // Case Details
        subject: body.subject || body.callPurpose || call.subject,
        category: body.category || body.caseType || call.category,
        description: body.description || call.description,
        summary: body.summary || call.summary,
        notes: body.notes || body.actionsTaken || call.notes,
        resolution: body.resolution || body.nextAction || call.resolution,
        // Management
        status: changes.status ? changes.status.to : call.status,
        priority: changes.priority ? changes.priority.to : call.priority,
        assignedOfficer: body.assignedOfficer || call.assignedOfficer,
        // Follow-up
        followUpRequired: body.followUpRequired !== undefined ? body.followUpRequired : call.followUpRequired,
        followUpDate: changes.followUpDate ? changes.followUpDate.to : call.followUpDate,
        // Call Details
        callDescription: body.callDescription || call.callDescription,
        purpose: body.purpose || call.purpose,
        // Update timestamp
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Case updated successfully. ${Object.keys(changes).length} fields changed.`,
      case: updatedCall,
      changes: {
        count: Object.keys(changes).length,
        fields: Object.keys(changes),
        details: changes
      },
      auditLogCreated: true
    });

  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}
