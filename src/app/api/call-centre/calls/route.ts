import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!session.user.permissions?.includes('callcentre.access')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all calls without pagination for now
    const calls = await prisma.call_records.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend interface
    const transformedCalls = calls.map(call => ({
      id: call.id,
      callNumber: call.callNumber || call.id,
      caseNumber: call.caseNumber,
      officerName: call.officerName,
      // Caller Information
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      callerAge: call.callerAge,
      callerGender: call.callerGender,
      callerKeyPopulation: call.callerKeyPopulation,
      callerProvince: call.callerProvince,
      callerAddress: call.callerAddress,
      // Call Details
      communicationMode: call.modeOfCommunication || call.callType || 'inbound',
      howDidYouHearAboutUs: call.howDidYouHearAboutUs,
      callValidity: call.callValidity,
      newOrRepeatCall: call.newOrRepeatCall,
      language: call.language,
      callDescription: call.callDescription,
      purpose: call.purpose || 'HIV/AIDS',
      isCase: call.isCase,
      // Client Information
      clientName: call.clientName,
      clientAge: call.clientAge,
      clientSex: call.clientSex,
      clientAddress: call.clientAddress,
      clientProvince: call.clientProvince,
      // Additional Information
      perpetrator: call.perpetrator,
      servicesRecommended: call.servicesRecommended,
      referral: call.referral,
      voucherIssued: call.voucherIssued,
      voucherValue: call.voucherValue,
      comment: call.comment,
      // System fields
      officer: call.assignedOfficer || call.officerName || 'Unassigned',
      dateTime: call.createdAt.toISOString(),
      status: call.status,
      notes: call.notes
    }));

    return NextResponse.json({
      success: true,
      calls: transformedCalls,
      total: transformedCalls.length
    })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('calls.create') ||
                         session.user?.permissions?.includes('calls.full_access') ||
                         session.user?.permissions?.includes('callcentre.access') ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      // Auto-generated fields
      officerName,
      callNumber,
      caseNumber,
      // Caller Information
      callerFullName,
      callerPhoneNumber,
      callerAge,
      callerGender,
      callerKeyPopulation,
      callerProvince,
      callerAddress,
      // Call Details
      modeOfCommunication,
      howDidYouHearAboutUs,
      callValidity,
      newOrRepeatCall,
      language,
      callDescription,
      purpose,
      isCase,
      // Client Information
      clientName,
      clientAge,
      clientSex,
      clientAddress,
      clientProvince,
      // Additional Information
      perpetrator,
      servicesRecommended,
      referral,
      voucherIssued,
      voucherValue,
      comment,
      // Legacy fields for compatibility
      callerName,
      callerPhone,
      callerEmail,
      callType,
      priority,
      subject,
      description,
      assignedTo
    } = body

    // Create new call record
    const call = await prisma.call_records.create({
      data: {
        id: randomUUID(),
        caseNumber: caseNumber || `CASE-${Date.now()}`,
        callNumber: callNumber || `${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}/${new Date().getFullYear()}`,
        officerName: officerName || session.user.name,
        // Caller Information
        callerName: callerFullName || callerName || 'Unknown',
        callerPhone: callerPhoneNumber || callerPhone,
        callerEmail: callerEmail,
        callerAge: callerAge,
        callerGender: callerGender,
        callerKeyPopulation: callerKeyPopulation,
        callerProvince: callerProvince,
        callerAddress: callerAddress,
        // Call Details
        callType: modeOfCommunication || callType || 'inbound',
        modeOfCommunication: modeOfCommunication || 'inbound',
        howDidYouHearAboutUs: howDidYouHearAboutUs,
        callValidity: callValidity || 'valid',
        newOrRepeatCall: newOrRepeatCall || 'new',
        language: language || 'English',
        callDescription: callDescription,
        purpose: purpose || 'HIV/AIDS',
        isCase: isCase || 'NO',
        // Client Information
        clientName: clientName,
        clientAge: clientAge,
        clientSex: clientSex,
        clientAddress: clientAddress,
        clientProvince: clientProvince,
        // Additional Information
        perpetrator: perpetrator,
        servicesRecommended: servicesRecommended,
        referral: referral,
        voucherIssued: voucherIssued || 'NO',
        voucherValue: voucherValue,
        comment: comment,
        // System Fields
        category: 'INQUIRY',
        priority: priority || 'MEDIUM',
        subject: subject || callDescription || 'Call inquiry',
        description: description || callDescription || comment,
        summary: callDescription || comment || 'Call inquiry',
        notes: comment || description,
        assignedOfficer: assignedTo || session.user.name,
        status: 'OPEN',
        callStartTime: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      call: call,
      message: 'Call record created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
