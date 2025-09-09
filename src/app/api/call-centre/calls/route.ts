import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

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

    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('id')

    // If ID is provided, fetch single call
    if (callId) {
      const call = await prisma.callRecord.findUnique({
        where: { id: callId }
      })

      if (!call) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 })
      }

      // Transform single call data
      const transformedCall = {
        id: call.id,
        callNumber: call.id,
        caseNumber: call.caseNumber,
        
        // Basic call info
        date: call.createdAt.toISOString().split('T')[0],
        time: call.createdAt.toTimeString().split(' ')[0].slice(0, 5),
        officerName: call.assignedOfficer || 'Admin User',
        
        // Caller details
        callerFullName: call.callerName,
        callerPhoneNumber: call.callerPhone,
        callerEmail: (call as any).callerEmail || null,
        callerAge: (call as any).callerAge || null,
        callerGender: (call as any).callerGender || null,
        callerProvince: (call as any).callerProvince || null,
        callerAddress: (call as any).callerAddress || null,
        callerKeyPopulation: (call as any).callerKeyPopulation || null,
        
        // Client details
        clientFullName: (call as any).clientName || (call as any).clientFullName || null,
        clientAge: (call as any).clientAge || null,
        clientGender: (call as any).clientGender || null,
        clientProvince: (call as any).clientProvince || null,
        clientKeyPopulation: (call as any).clientKeyPopulation || null,
        clientEmploymentStatus: (call as any).clientEmploymentStatus || null,
        clientEducationLevel: (call as any).clientEducationLevel || null,
        
        // Call details
        modeOfCommunication: (call as any).modeOfCommunication || call.callType || 'inbound',
        language: (call as any).language || 'English',
        callValidity: (call as any).callValidity || 'valid',
        newOrRepeatCall: (call as any).newOrRepeatCall || 'new',
        howDidYouHearAboutUs: (call as any).howDidYouHearAboutUs || null,
        
        // Priority and category
        priority: (call as any).priority || call.priority || 'MEDIUM',
        category: (call as any).category || call.category || 'INQUIRY',
        
        // Location
        district: (call as any).district || call.district || null,
        ward: (call as any).ward || call.ward || null,
        
        // Content
        purpose: (call as any).purpose || call.subject || 'General Inquiry',
        issueDescription: (call as any).issueDescription || call.description || null,
        summary: (call as any).summary || call.summary || null,
        
        // Resolution and service
        resolution: (call as any).resolution || call.resolution || null,
        servicesRecommended: (call as any).servicesRecommended || null,
        referral: (call as any).referralDetails || (call as any).referral || null,
        
        // Voucher info
        voucherIssued: (call as any).voucherIssued || 'no',
        voucherValue: (call as any).voucherValue || null,
        
        // Follow-up
        followUpRequired: call.followUpRequired || false,
        followUpDate: call.followUpDate?.toISOString() || null,
        followUpNotes: (call as any).followUpNotes || null,
        
        // Additional info
        additionalNotes: (call as any).additionalNotes || call.notes || null,
        satisfactionRating: (call as any).satisfactionRating || null,
        callOutcome: (call as any).callOutcome || call.status || 'In Progress',
        
        // Timestamps
        createdAt: call.createdAt.toISOString(),
        updatedAt: call.updatedAt?.toISOString() || call.createdAt.toISOString()
      }

      return NextResponse.json(transformedCall)
    }

    // Get all calls without pagination for now
    const calls = await prisma.callRecord.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend interface - use safe optional access for new fields
    const transformedCalls = calls.map(call => ({
      id: call.id,
      callNumber: call.id,
      caseNumber: call.caseNumber,
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      callerEmail: (call as any).callerEmail || null,
      callerAge: (call as any).callerAge || null,
      callerGender: (call as any).callerGender || null,
      callerProvince: (call as any).callerProvince || null,
      callerAddress: (call as any).callerAddress || null,
      callerKeyPopulation: (call as any).callerKeyPopulation || null,
      
      // Client details
      clientName: (call as any).clientName || null,
      clientAge: (call as any).clientAge || null,
      clientGender: (call as any).clientGender || null,
      clientProvince: (call as any).clientProvince || null,
      clientKeyPopulation: (call as any).clientKeyPopulation || null,
      clientEmploymentStatus: (call as any).clientEmploymentStatus || null,
      clientEducationLevel: (call as any).clientEducationLevel || null,
      
      // Call details
      communicationMode: (call as any).communicationMode || call.callType || 'INBOUND',
      callLanguage: (call as any).callLanguage || null,
      callValidity: (call as any).callValidity || 'Valid',
      newOrRepeatCall: (call as any).newOrRepeatCall || null,
      howHeardAboutUs: (call as any).howHeardAboutUs || null,
      callDurationMinutes: (call as any).callDurationMinutes || null,
      
      // Location details
      district: (call as any).district || call.district || null,
      ward: (call as any).ward || call.ward || null,
      
      // Service and case info
      purpose: call.subject || 'General Inquiry',
      description: call.description,
      summary: call.summary,
      priority: call.priority,
      category: call.category,
      validity: (call as any).callValidity || 'Valid',
      officer: call.assignedOfficer || 'Unassigned',
      assignedOfficer: call.assignedOfficer,
      
      // Timing
      dateTime: call.createdAt.toISOString(),
      callStartTime: call.callStartTime?.toISOString(),
      callEndTime: call.callEndTime?.toISOString(),
      duration: (call as any).callDurationMinutes ? `${(call as any).callDurationMinutes} min` : null,
      
      // Status and resolution
      status: call.status,
      resolution: (call as any).resolution || call.resolution || null,
      referredTo: (call as any).referralDetails || call.resolution || null,
      
      // Service details
      voucherIssued: (call as any).voucherIssued ? 'YES' : 'NO',
      voucherValue: (call as any).voucherValue || null,
      servicesRecommended: (call as any).servicesRecommended || null,
      
      // Additional tracking
      perpetratorInfo: (call as any).perpetratorInfo || null,
      isCase: (call as any).isCase || false,
      followUpRequired: call.followUpRequired,
      followUpDate: call.followUpDate?.toISOString(),
      
      // Notes and feedback
      notes: call.notes,
      satisfactionRating: (call as any).satisfactionRating || call.satisfactionRating || null
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
      // Basic call info
      callerName,
      callerPhone,
      callerEmail,
      callType,
      priority,
      category,
      subject,
      description,
      summary,
      assignedOfficer,
      
      // Caller details
      callerAge,
      callerGender,
      callerProvince,
      callerAddress,
      callerKeyPopulation,
      
      // Client details
      clientName,
      clientAge,
      clientGender,
      clientProvince,
      clientKeyPopulation,
      clientEmploymentStatus,
      clientEducationLevel,
      
      // Call details
      communicationMode,
      callLanguage,
      callValidity,
      newOrRepeatCall,
      howHeardAboutUs,
      callDurationMinutes,
      
      // Location details
      district,
      ward,
      
      // Service details
      voucherIssued,
      voucherValue,
      servicesRecommended,
      referralDetails,
      
      // Resolution and feedback
      resolution,
      satisfactionRating,
      
      // Additional tracking
      perpetratorInfo,
      isCase,
      notes,
      followUpRequired,
      followUpDate
    } = body

    // Generate unique case number
    const timestamp = Date.now()
    const caseNumber = `CASE-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`

    // Create new call record with all fields (using type assertion for new fields)
    const callData: any = {
      caseNumber,
      callerName: callerName || 'Unknown',
      callerPhone,
      callerEmail,
      callType: callType || 'INBOUND',
      category: category || 'INQUIRY',
      priority: priority || 'MEDIUM',
      subject: subject || 'Call inquiry',
      description: description || '',
      summary: summary || subject || 'Call inquiry',
      assignedOfficer: assignedOfficer || session.user?.name || 'Unassigned',
      status: 'OPEN',
      
      // Caller details
      callerAge,
      callerGender,
      callerProvince,
      callerAddress,
      callerKeyPopulation,
      
      // Client details
      clientName,
      clientAge,
      clientGender,
      clientProvince,
      clientKeyPopulation,
      clientEmploymentStatus,
      clientEducationLevel,
      
      // Call details
      communicationMode,
      callLanguage: callLanguage || 'English',
      callValidity: callValidity || 'valid',
      newOrRepeatCall: newOrRepeatCall || 'new',
      howHeardAboutUs,
      callDurationMinutes: callDurationMinutes ? parseInt(callDurationMinutes) : null,
      
      // Location details
      district,
      ward,
      
      // Service details
      voucherIssued: voucherIssued === 'yes' || voucherIssued === true,
      voucherValue: voucherValue ? parseFloat(voucherValue) : null,
      servicesRecommended,
      referralDetails,
      
      // Resolution and feedback
      resolution,
      satisfactionRating: satisfactionRating ? parseInt(satisfactionRating) : null,
      
      // Additional tracking
      perpetratorInfo,
      isCase: isCase === 'YES' || isCase === true,
      notes: notes || '',
      followUpRequired: followUpRequired === true,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      
      // Timing
      callStartTime: new Date()
    }

    const call = await prisma.callRecord.create({
      data: callData
    })

    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
