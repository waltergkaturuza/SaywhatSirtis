import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';
import { canonicalCaseStatus, caseDateKey, recordCaseHistory, trackChange } from '@/lib/case-audit';

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
      clientName: call.callerName || call.clientName || '',
      clientPhone: call.callerPhone || '',
      clientEmail: call.callerEmail || '',
      clientAge: call.callerAge || '',
      clientGender: call.callerGender || '',
      clientAddress: call.callerAddress || '',
      clientProvince: call.callerProvince || '',
      // Call Information
      callType: call.callType || '',
      modeOfCommunication: call.modeOfCommunication || '',
      callDescription: call.callDescription || '',
      purpose: call.purpose || '',
      // Case Management
      assignedOfficer: call.assignedOfficer || '',
      notes: call.notes || '',
      summary: call.summary || '',
      resolution: call.resolution || '',
      followUpRequired: call.followUpRequired,
      followUpDate: call.followUpDate,
      // Dates
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
      callStartTime: call.callStartTime,
      callEndTime: call.callEndTime,
      duration: call.callEndTime && call.callStartTime ? 
        `${Math.round((new Date(call.callEndTime).getTime() - new Date(call.callStartTime).getTime()) / 60000)} min` : 'N/A',
      resolvedAt: call.resolvedAt,
      // Additional fields for frontend compatibility
      createdDate: call.createdAt.toISOString().split('T')[0],
      lastUpdated: call.updatedAt.toISOString().split('T')[0],
      callPurpose: call.subject || 'General Inquiry',
      caseType: call.category || 'General',
      description: call.description || '',
      actionsTaken: call.notes || '',
      nextAction: call.resolution || '',
      referrals: call.referral || '',
      outcome: call.status === 'RESOLVED' ? 'Resolved' : call.status === 'CLOSED' ? 'Closed' : 'Pending',
      closedDate: call.resolvedAt || (['CLOSED', 'RESOLVED'].includes(String(call.status || '').toUpperCase()) ? call.updatedAt : null)
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

    const valueOrCurrent = (incoming: unknown, current: string | null) => {
      if (incoming === undefined || incoming === null) return current || ''
      return String(incoming)
    }

    const nextStatus = body.status !== undefined && body.status !== null && String(body.status).trim() !== ''
      ? canonicalCaseStatus(body.status)
      : canonicalCaseStatus(call.status) || 'OPEN'
    const nextPriority = body.priority !== undefined && String(body.priority).trim() !== ''
      ? String(body.priority).toUpperCase()
      : (call.priority || 'MEDIUM')
    const notesChanged = body.notes !== undefined && String(body.notes).trim() !== String(call.notes || '').trim()
    const actionsChanged = body.actionsTaken !== undefined && String(body.actionsTaken).trim() !== String(call.notes || '').trim()
    const nextNotes = notesChanged
      ? String(body.notes)
      : actionsChanged
        ? String(body.actionsTaken)
        : (call.notes || '')
    const resolutionChanged = body.resolution !== undefined && String(body.resolution).trim() !== String(call.resolution || '').trim()
    const nextActionChanged = body.nextAction !== undefined && String(body.nextAction).trim() !== String(call.resolution || '').trim()
    const nextResolution = resolutionChanged
      ? String(body.resolution)
      : nextActionChanged
        ? String(body.nextAction)
        : (call.resolution || '')
    const nextFollowUp = body.followUpDate === undefined
      ? call.followUpDate
      : body.followUpDate
        ? new Date(body.followUpDate)
        : null

    let nextCallEndTime = call.callEndTime
    let nextDurationLabel = call.callEndTime && call.callStartTime
      ? `${Math.round((new Date(call.callEndTime).getTime() - new Date(call.callStartTime).getTime()) / 60000)} min`
      : 'N/A'
    if (body.duration && body.duration !== 'N/A' && call.callStartTime) {
      const durationMatch = String(body.duration).match(/(\d+)/)
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1], 10)
        nextCallEndTime = new Date(new Date(call.callStartTime).getTime() + minutes * 60000)
        nextDurationLabel = `${minutes} min`
      }
    }

    const finishedStatuses = ['CLOSED', 'RESOLVED']
    const nextIsFinished = finishedStatuses.includes(nextStatus)
    const wasFinished = finishedStatuses.includes(canonicalCaseStatus(call.status))
    const statusChanged = nextStatus !== canonicalCaseStatus(call.status)
    let resolvedAt = call.resolvedAt
    if (nextIsFinished && statusChanged) {
      resolvedAt = new Date()
    } else if (nextIsFinished && !call.resolvedAt) {
      resolvedAt = call.updatedAt
    } else if (!nextIsFinished && wasFinished) {
      resolvedAt = null
    }

    const changes: Record<string, { from: string; to: string; fieldLabel: string }> = {}
    trackChange(changes, 'callerName', 'Client Name', call.callerName, valueOrCurrent(body.clientName ?? body.callerName, call.callerName))
    trackChange(changes, 'callerPhone', 'Phone', call.callerPhone, valueOrCurrent(body.clientPhone ?? body.callerPhone, call.callerPhone))
    trackChange(changes, 'callerEmail', 'Email', call.callerEmail, valueOrCurrent(body.clientEmail ?? body.callerEmail, call.callerEmail))
    trackChange(changes, 'callerAge', 'Age', call.callerAge, valueOrCurrent(body.clientAge ?? body.callerAge, call.callerAge))
    trackChange(changes, 'callerGender', 'Gender', call.callerGender, valueOrCurrent(body.clientGender ?? body.callerGender, call.callerGender))
    trackChange(changes, 'callerAddress', 'Address', call.callerAddress, valueOrCurrent(body.clientAddress ?? body.callerAddress, call.callerAddress))
    trackChange(changes, 'callerProvince', 'Province', call.callerProvince, valueOrCurrent(body.clientProvince ?? body.callerProvince, call.callerProvince))
    trackChange(changes, 'status', 'Status', canonicalCaseStatus(call.status) || 'OPEN', nextStatus)
    trackChange(changes, 'priority', 'Priority', call.priority, nextPriority)
    trackChange(changes, 'assignedOfficer', 'Assigned Officer', call.assignedOfficer, valueOrCurrent(body.assignedOfficer, call.assignedOfficer))
    trackChange(changes, 'category', 'Case Type', call.category, valueOrCurrent(body.caseType ?? body.category, call.category))
    trackChange(changes, 'purpose', 'Purpose', call.purpose, valueOrCurrent(body.purpose, call.purpose))
    trackChange(changes, 'summary', 'Summary', call.summary, valueOrCurrent(body.summary, call.summary))
    trackChange(changes, 'description', 'Description', call.description, valueOrCurrent(body.description, call.description))
    trackChange(changes, 'callDescription', 'Call Description', call.callDescription, valueOrCurrent(body.callDescription, call.callDescription))
    trackChange(changes, 'notes', 'Notes', call.notes, nextNotes)
    if (actionsChanged && String(body.actionsTaken).trim() !== nextNotes.trim()) {
      trackChange(changes, 'actionsTaken', 'Actions Taken', call.notes, body.actionsTaken)
    }
    trackChange(changes, 'resolution', 'Resolution', call.resolution, nextResolution)
    if (nextActionChanged && String(body.nextAction).trim() !== nextResolution.trim()) {
      trackChange(changes, 'nextAction', 'Next Action', call.resolution, body.nextAction)
    }
    trackChange(changes, 'referral', 'Referral', call.referral, valueOrCurrent(body.referrals ?? body.referral, call.referral))
    const previousOutcome = canonicalCaseStatus(call.status) === 'RESOLVED'
      ? 'Resolved'
      : canonicalCaseStatus(call.status) === 'CLOSED'
        ? 'Closed'
        : 'Pending'
    trackChange(changes, 'outcome', 'Outcome', previousOutcome, valueOrCurrent(body.outcome, previousOutcome))
    trackChange(changes, 'followUpDate', 'Follow-up Date', caseDateKey(call.followUpDate), caseDateKey(nextFollowUp))
    trackChange(changes, 'duration', 'Duration', call.callEndTime && call.callStartTime
      ? `${Math.round((new Date(call.callEndTime).getTime() - new Date(call.callStartTime).getTime()) / 60000)} min`
      : 'N/A', nextDurationLabel)
    trackChange(changes, 'resolvedAt', nextStatus === 'RESOLVED' ? 'Resolved On' : 'Closed On', caseDateKey(call.resolvedAt), caseDateKey(resolvedAt))

    if (Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        case: call
      });
    }

    const subjectIncoming = valueOrCurrent(body.subject ?? body.callPurpose, call.subject)
    const updatedCall = await prisma.call_records.update({
      where: { id: call.id },
      data: {
        callerName: valueOrCurrent(body.clientName ?? body.callerName, call.callerName) || call.callerName,
        callerPhone: valueOrCurrent(body.clientPhone ?? body.callerPhone, call.callerPhone),
        callerEmail: valueOrCurrent(body.clientEmail ?? body.callerEmail, call.callerEmail),
        callerAge: valueOrCurrent(body.clientAge ?? body.callerAge, call.callerAge),
        callerGender: valueOrCurrent(body.clientGender ?? body.callerGender, call.callerGender),
        callerAddress: valueOrCurrent(body.clientAddress ?? body.callerAddress, call.callerAddress),
        callerProvince: valueOrCurrent(body.clientProvince ?? body.callerProvince, call.callerProvince),
        subject: subjectIncoming || call.subject,
        category: valueOrCurrent(body.caseType ?? body.category, call.category),
        description: valueOrCurrent(body.description, call.description),
        summary: valueOrCurrent(body.summary, call.summary),
        notes: nextNotes,
        resolution: nextResolution,
        status: nextStatus,
        priority: nextPriority,
        assignedOfficer: valueOrCurrent(body.assignedOfficer, call.assignedOfficer),
        followUpRequired: body.followUpRequired !== undefined ? body.followUpRequired : call.followUpRequired,
        followUpDate: nextFollowUp,
        callEndTime: nextCallEndTime,
        callDescription: valueOrCurrent(body.callDescription, call.callDescription),
        purpose: valueOrCurrent(body.purpose, call.purpose),
        referral: valueOrCurrent(body.referrals ?? body.referral, call.referral),
        resolvedAt,
        updatedAt: new Date()
      }
    });

    const historyAction = statusChanged && nextStatus === 'CLOSED'
      ? 'CLOSE'
      : statusChanged && nextStatus === 'RESOLVED'
        ? 'RESOLVE'
        : 'UPDATE'
    const historySaved = await recordCaseHistory({
      caseId: call.id,
      caseNumber: call.caseNumber,
      action: historyAction,
      changes,
      reason: body.changeReason,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      request,
    })

    return NextResponse.json({
      success: true,
      message: `Case updated successfully. ${Object.keys(changes).length} fields changed.`,
      case: updatedCall,
      changes: {
        count: Object.keys(changes).length,
        fields: Object.keys(changes),
        details: changes
      },
      auditLogCreated: historySaved
    });

  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}
