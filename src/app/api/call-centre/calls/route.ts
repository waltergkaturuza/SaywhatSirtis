import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/db-connection'
import { randomUUID } from 'crypto'
import { rateLimit, getClientIP, withErrorHandling } from '@/lib/production-helpers'

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre calls API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

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
      officer: call.officerName || call.assignedOfficer || 'N/A', // Map for frontend compatibility
      communicationMode: call.modeOfCommunication || 'N/A', // Map for frontend
      validity: call.callValidity || 'N/A',
      dateTime: call.createdAt?.toISOString() || new Date().toISOString(),
      duration: call.callEndTime && call.callStartTime ? 
        `${Math.round((new Date(call.callEndTime).getTime() - new Date(call.callStartTime).getTime()) / 60000)} min` : 'N/A',
      voucherIssued: call.voucherIssued || 'N/A',
      referredTo: call.referral,
      // Caller Information
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      callerAge: call.callerAge,
      callerGender: call.callerGender,
      callerKeyPopulation: call.callerKeyPopulation,
      callerProvince: call.callerProvince,
      callerAddress: call.callerAddress,
      // Call Details
      callType: call.callType,
      howDidYouHearAboutUs: call.howDidYouHearAboutUs,
      callValidity: call.callValidity,
      newOrRepeatCall: call.newOrRepeatCall,
      language: call.language,
      callDescription: call.callDescription,
      purpose: call.purpose,
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
      voucherValue: call.voucherValue,
      comment: call.comment,
      // System fields
      category: call.category,
      priority: call.priority,
      status: call.status,
      subject: call.subject,
      description: call.description,
      assignedOfficer: call.assignedOfficer,
      summary: call.summary,
      notes: call.notes,
      resolution: call.resolution,
      satisfactionRating: call.satisfactionRating,
      callStartTime: call.callStartTime,
      callEndTime: call.callEndTime,
      resolvedAt: call.resolvedAt,
      district: call.district,
      ward: call.ward,
      followUpRequired: call.followUpRequired,
      followUpDate: call.followUpDate,
      createdAt: call.createdAt,
      updatedAt: call.updatedAt
    }))

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
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP, true)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    // Check database connection first
    const isConnected = await checkDatabaseConnection()
    if (!isConnected) {
      console.error('Database connection failed in call centre calls POST API')
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' }, 
        { status: 503 }
      )
    }

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
    
    // Validate required fields and data sizes
    if (!body.callerFullName && !body.callerName) {
      return NextResponse.json(
        { error: 'Caller name is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Check referral data size and structure
    if (body.referral && typeof body.referral === 'object') {
      // Convert referral object to string if needed
      body.referral = JSON.stringify(body.referral)
    }

    // Validate field lengths to prevent database errors
    const fieldLimits = {
      callerName: 255,
      callerPhone: 50,
      callerEmail: 255,
      clientName: 255,
      perpetrator: 255,
      servicesRecommended: 500,
      voucherValue: 50
    }

    for (const [field, limit] of Object.entries(fieldLimits)) {
      if (body[field] && body[field].length > limit) {
        return NextResponse.json(
          { 
            error: `${field} exceeds maximum length of ${limit} characters`,
            code: 'FIELD_TOO_LONG'
          },
          { status: 400 }
        )
      }
    }

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
      callStartTime,
      callEndTime,
      callDuration,
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

    // Generate systematic case number if not provided
    let finalCaseNumber = caseNumber
    if (!finalCaseNumber) {
      const currentYear = new Date().getFullYear()
      
      // Use a simpler but robust approach - check and retry if needed
      for (let attempt = 1; attempt <= 10; attempt++) {
        // Find the current max case number for this year
        const maxCaseQuery = await prisma.call_records.findFirst({
          where: {
            caseNumber: {
              startsWith: `CASE-${currentYear}-`
            }
          },
          orderBy: {
            caseNumber: 'desc'
          },
          select: {
            caseNumber: true
          }
        })
        
        let nextNumber = 1
        if (maxCaseQuery?.caseNumber) {
          const numberPart = maxCaseQuery.caseNumber.split('-')[2]
          if (numberPart && !isNaN(parseInt(numberPart))) {
            nextNumber = parseInt(numberPart) + 1
          }
        }
        
        // Format the case number
        const formattedNumber = nextNumber.toString().padStart(8, '0')
        const candidateCaseNumber = `CASE-${currentYear}-${formattedNumber}`
        
        // Check if this number is already taken
        const existing = await prisma.call_records.findUnique({
          where: { caseNumber: candidateCaseNumber }
        })
        
        if (!existing) {
          finalCaseNumber = candidateCaseNumber
          break
        }
        
        // If we're on the last attempt and still no unique number, use fallback
        if (attempt === 10) {
          const timestamp = Date.now().toString().slice(-8)
          finalCaseNumber = `CASE-${currentYear}-${timestamp}`
        }
      }
    }

    // Generate systematic call number if not provided
    let finalCallNumber = callNumber
    if (!finalCallNumber) {
      const currentYear = new Date().getFullYear()
      
      // Use a simpler but robust approach - check and retry if needed
      for (let attempt = 1; attempt <= 10; attempt++) {
        // Find the current max call number for this year
        const maxCallQuery = await prisma.call_records.findFirst({
          where: {
            callNumber: {
              endsWith: `/${currentYear}`
            }
          },
          orderBy: {
            callNumber: 'desc'
          },
          select: {
            callNumber: true
          }
        })
        
        let nextNumber = 1
        if (maxCallQuery?.callNumber) {
          const numberPart = maxCallQuery.callNumber.split('/')[0]
          if (numberPart && !isNaN(parseInt(numberPart))) {
            nextNumber = parseInt(numberPart) + 1
          }
        }
        
        // Format the call number
        const formattedNumber = nextNumber.toString().padStart(7, '0')
        const candidateCallNumber = `${formattedNumber}/${currentYear}`
        
        // Check if this number is already taken
        const existing = await prisma.call_records.findFirst({
          where: { callNumber: candidateCallNumber }
        })
        
        if (!existing) {
          finalCallNumber = candidateCallNumber
          break
        }
        
        // If we're on the last attempt and still no unique number, use fallback
        if (attempt === 10) {
          const timestamp = Date.now().toString().slice(-7)
          finalCallNumber = `${timestamp}/${currentYear}`
        }
      }
    }

    // Handle call duration - use manual duration if provided, otherwise use actual times
    let finalCallStartTime = callStartTime ? new Date(callStartTime) : new Date()
    let finalCallEndTime = null

    if (callDuration && !isNaN(parseInt(callDuration))) {
      // Manual duration provided - calculate end time
      const durationMinutes = parseInt(callDuration)
      finalCallEndTime = new Date(finalCallStartTime.getTime() + (durationMinutes * 60 * 1000))
    } else if (callEndTime) {
      // Actual end time provided
      finalCallEndTime = new Date(callEndTime)
    }

    // Create new call record
    const call = await prisma.call_records.create({
      data: {
        id: randomUUID(),
        caseNumber: finalCaseNumber,
        callNumber: finalCallNumber,
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
        callStartTime: finalCallStartTime,
        callEndTime: finalCallEndTime,
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
    
    // Handle Prisma unique constraint error specifically
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as any
      
      switch (prismaError.code) {
        case 'P2002':
          return NextResponse.json({ 
            success: false,
            error: 'Duplicate case number detected. Please try again.',
            code: 'DUPLICATE_CASE'
          }, { status: 409 })
        case 'P2025':
          return NextResponse.json({ 
            success: false,
            error: 'Record not found.',
            code: 'RECORD_NOT_FOUND'
          }, { status: 404 })
        case 'P2003':
          return NextResponse.json({ 
            success: false,
            error: 'Invalid reference data provided.',
            code: 'INVALID_REFERENCE'
          }, { status: 400 })
        default:
          return NextResponse.json({ 
            success: false,
            error: 'Database error occurred.',
            code: 'DATABASE_ERROR'
          }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}