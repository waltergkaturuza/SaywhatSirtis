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

    // Get all calls without pagination for now
    const calls = await prisma.callRecord.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend interface
    const transformedCalls = calls.map(call => ({
      id: call.id,
      callNumber: call.caseNumber,
      caseNumber: call.caseNumber,
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      callerProvince: (call as any).province ?? (call as any).district ?? null,
      callerAge: (call as any).callerAgeGroup ?? null,
      callerGender: (call as any).callerGender ?? null,
      clientName: (call as any).clientName ?? call.callerName,
      clientAge: (call as any).clientAge ?? null,
      clientSex: (call as any).clientSex ?? null,
      communicationMode: (() => {
        // Map enum/channel + direction into the UI's single field
        const mode = (call as any).communicationMode
        if (mode === 'WHATSAPP') return 'whatsapp'
        if (mode === 'TEXT') return 'text'
        if (mode === 'WALK_IN') return 'walk'
        return call.callType === 'OUTBOUND' ? 'outbound' : 'inbound'
      })(),
      purpose: (call as any).purpose ?? call.summary ?? 'General Inquiry',
      validity: (call as any).validity ? ((call as any).validity[0].toUpperCase() + (call as any).validity.slice(1)) : 'Valid',
      officer: call.assignedOfficer || 'Unassigned',
      dateTime: call.createdAt.toISOString(),
      duration: call.callEndTime && call.callStartTime ? 
        Math.round((call.callEndTime.getTime() - call.callStartTime.getTime()) / 1000 / 60) : null,
      status: call.status,
      referredTo: call.resolution || null,
      voucherIssued: (call as any).voucherIssued ? 'YES' : 'NO',
      voucherValue: (call as any).voucherValue ?? null,
      notes: call.notes || (call as any).description || (call as any).comment || null
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
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('manager')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      callerName,
      callerPhone,
      callerEmail,
      // UI mixed "mode" and direction
      modeOfCommunication,
      howDidYouHearAboutUs,
      callValidity,
      newOrRepeatCall,
      language,
      callerFullName,
      callerAge,
      callerKeyPopulation,
      callerGender,
      callerProvince,
      callerAddress,
      callDescription,
      purpose,
      isCase,
      perpetrator,
      servicesRecommended,
      referral,
      clientName: clientNameInput,
      clientAge,
      clientSex,
      clientAddress,
      clientProvince,
      voucherIssued,
      voucherValue,
      comment,
      priority,
      subject,
      description,
      assignedTo
    } = body

    // Derive enums/fields
    const derivedCallType = ((): 'INBOUND' | 'OUTBOUND' => {
      if (modeOfCommunication === 'outbound') return 'OUTBOUND'
      return 'INBOUND'
    })()

    const derivedCommMode = ((): 'PHONE' | 'WHATSAPP' | 'WALK_IN' | 'TEXT' => {
      if (modeOfCommunication === 'whatsapp') return 'WHATSAPP'
      if (modeOfCommunication === 'walk') return 'WALK_IN'
      if (modeOfCommunication === 'text') return 'TEXT'
      return 'PHONE'
    })()

    // Create new call record with graceful fallback if schema is not yet migrated
    const fullData: any = {
      caseNumber: `CASE-${Date.now()}`,
      callerName: callerName || callerFullName,
      callerPhone,
      callerEmail,
      callType: derivedCallType,
      communicationMode: derivedCommMode,
      category: 'INQUIRY',
      priority: priority || 'MEDIUM',
      summary: subject,
      description: description || callDescription,
      notes: comment,
      purpose,
      validity: callValidity,
      newOrRepeatCall,
      howDidYouHearAboutUs,
      language,
      province: callerProvince,
      address: callerAddress,
      callerAgeGroup: callerAge,
      callerGender,
      callerKeyPopulation,
      clientName: clientNameInput,
      clientAge,
      clientSex,
      clientAddress,
      clientProvince,
      voucherIssued: voucherIssued === 'YES',
      voucherValue: voucherValue ? parseFloat(voucherValue) : undefined,
      isCase: isCase === 'YES',
      assignedOfficer: assignedTo,
      assignedOfficerName: session.user?.name ?? undefined,
      status: 'OPEN',
      callStartTime: new Date()
    }

    const baseData = {
      caseNumber: fullData.caseNumber,
      callerName: fullData.callerName,
      callerPhone: fullData.callerPhone,
      callerEmail: fullData.callerEmail,
      callType: fullData.callType,
      category: 'INQUIRY',
      priority: priority || 'MEDIUM',
      summary: subject,
      notes: description || callDescription || comment,
      assignedOfficer: assignedTo,
      status: 'OPEN',
      callStartTime: new Date()
    } as const

    let call
    try {
      call = await prisma.callRecord.create({ data: fullData as any })
    } catch (e) {
      // Fallback if Prisma client hasn't been regenerated yet or DB not migrated
      call = await prisma.callRecord.create({ data: baseData as any })
    }

    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
