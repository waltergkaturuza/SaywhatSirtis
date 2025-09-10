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
      callNumber: call.id, // Use ID as call number for now
      caseNumber: call.id,
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      callerProvince: null, // Not available in current schema
      callerAge: null, // Not available in current schema
      callerGender: null, // Not available in current schema
      clientName: call.callerName, // Same as caller for now
      clientAge: null, // Not available in current schema
      clientSex: null, // Not available in current schema
      communicationMode: call.callType || 'INBOUND',
      purpose: call.summary || 'General Inquiry',
      validity: 'Valid', // Default for now
      officer: call.assignedOfficer || 'Unassigned',
      dateTime: call.createdAt.toISOString(),
      duration: null, // Not available in current schema
      status: call.status,
      referredTo: call.resolution || null,
      voucherIssued: 'NO', // Default for now
      voucherValue: null, // Not available in current schema
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
      callType,
      priority,
      subject,
      description,
      assignedTo
    } = body

    // Create new call record
    const call = await prisma.callRecord.create({
      data: {
        caseNumber: `CASE-${Date.now()}`, // Generate unique case number
        callerName,
        callerPhone,
        callerEmail,
        callType: callType || 'INBOUND',
        category: 'INQUIRY', // Default category
        priority: priority || 'MEDIUM',
        subject: subject || 'Call inquiry', // Required field
        description: description || '', // Description field
        summary: subject || 'Call inquiry', // Summary based on subject
        notes: description || '',
        assignedOfficer: assignedTo,
        status: 'OPEN',
        callStartTime: new Date()
      }
    })

    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
