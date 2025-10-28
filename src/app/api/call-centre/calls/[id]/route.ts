import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'

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

    // Check if user has call editing permissions (less restrictive than case editing)
    const hasPermission = session.user?.permissions?.some(permission => 
      ['callcentre.access', 'calls.edit', 'calls.full_access', 'callcentre.officer', 'data_capturer', 'admin'].includes(permission)
    ) || session.user?.roles?.some(role => 
      ['admin', 'manager', 'advance_user_1', 'call_center_officer', 'data_capturer', 'call_center_agent'].includes(role?.toLowerCase())
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions to edit calls' }, { status: 403 });
    }

    const callId = params.id;
    const body = await request.json();

    // Find the call record by ID
    const existingCall = await prisma.call_records.findUnique({
      where: { id: callId }
    });

    if (!existingCall) {
      return NextResponse.json({ error: 'Call record not found' }, { status: 404 });
    }

    // Prepare update data with proper field mapping
    const updateData: any = {
      // Caller Information
      callerName: body.callerName || existingCall.callerName,
      callerPhone: body.callerPhone || existingCall.callerPhone,
      callerEmail: body.callerEmail || existingCall.callerEmail,
      callerAge: body.callerAge || existingCall.callerAge,
      callerGender: body.callerGender || existingCall.callerGender,
      callerKeyPopulation: body.callerKeyPopulation || existingCall.callerKeyPopulation,
      callerProvince: body.callerProvince || existingCall.callerProvince,
      callerAddress: body.callerAddress || existingCall.callerAddress,
      
      // Client Information (separate from caller)
      clientName: body.clientName || existingCall.clientName,
      clientAge: body.clientAge || existingCall.clientAge,
      clientSex: body.clientSex || existingCall.clientSex,
      clientAddress: body.clientAddress || existingCall.clientAddress,
      clientProvince: body.clientProvince || existingCall.clientProvince,
      
      // Call Details
      modeOfCommunication: body.communicationMode || existingCall.modeOfCommunication,
      howDidYouHearAboutUs: body.howDidYouHearAboutUs || existingCall.howDidYouHearAboutUs,
      callValidity: body.validity || existingCall.callValidity,
      newOrRepeatCall: body.newOrRepeatCall || existingCall.newOrRepeatCall,
      language: body.language || existingCall.language,
      callDescription: body.callDescription || existingCall.callDescription,
      purpose: body.purpose || existingCall.purpose,
      isCase: body.isCase || existingCall.isCase,
      perpetrator: body.perpetrator || existingCall.perpetrator,
      servicesRecommended: body.servicesRecommended || existingCall.servicesRecommended,
      status: body.status || existingCall.status,
      referral: body.referredTo || existingCall.referral,
      notes: body.notes || existingCall.notes,
      comment: body.comment || existingCall.comment,
      
      // Voucher Information
      voucherIssued: body.voucherIssued || existingCall.voucherIssued,
      voucherValue: body.voucherValue || existingCall.voucherValue,
      
      // System fields
      updatedAt: new Date()
    };

    // Handle duration update - convert to callEndTime if callStartTime exists
    if (body.duration && body.duration !== 'N/A' && existingCall.callStartTime) {
      const durationMatch = body.duration.match(/(\d+)/);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1]);
        const startTime = new Date(existingCall.callStartTime);
        updateData.callEndTime = new Date(startTime.getTime() + minutes * 60000);
      }
    }

    // Update the call record
    const updatedCall = await prisma.call_records.update({
      where: { id: callId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      call: updatedCall,
      message: 'Call record updated successfully'
    });

  } catch (error) {
    console.error('Error updating call:', error);
    
    // Handle Prisma errors
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as any;
      
      switch (prismaError.code) {
        case 'P2025':
          return NextResponse.json({ 
            success: false,
            error: 'Call record not found.',
            code: 'RECORD_NOT_FOUND'
          }, { status: 404 });
        case 'P2002':
          return NextResponse.json({ 
            success: false,
            error: 'Duplicate data detected.',
            code: 'DUPLICATE_DATA'
          }, { status: 409 });
        default:
          return NextResponse.json({ 
            success: false,
            error: 'Database error occurred.',
            code: 'DATABASE_ERROR'
          }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    const callId = params.id;

    // Find the call record by ID
    const call = await prisma.call_records.findUnique({
      where: { id: callId }
    });

    if (!call) {
      return NextResponse.json({ error: 'Call record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      call: call
    });

  } catch (error) {
    console.error('Error fetching call:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
