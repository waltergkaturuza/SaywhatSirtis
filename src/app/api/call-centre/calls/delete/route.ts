import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

// Handle DELETE requests for call records
export async function DELETE(request: NextRequest) {
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
    
    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 })
    }

    // Get the call record before deletion
    const existingCall = await prisma.callRecord.findUnique({
      where: { id: callId }
    })

    if (!existingCall) {
      return NextResponse.json({ error: 'Call record not found' }, { status: 404 })
    }

    // Move to trash by updating status and adding deletion info
    const trashedCall = await prisma.callRecord.update({
      where: { id: callId },
      data: {
        status: 'DELETED',
        notes: `${existingCall.notes || ''}\n\n[DELETED] Moved to trash by ${session.user.name} on ${new Date().toISOString()}`,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Call record moved to trash successfully',
      deletedCall: {
        id: trashedCall.id,
        caseNumber: trashedCall.caseNumber,
        deletedAt: trashedCall.updatedAt.toISOString(),
        deletedBy: session.user.name
      }
    })
  } catch (error) {
    console.error('Error deleting call record:', error);
    return NextResponse.json(
      { error: 'Failed to delete call record' },
      { status: 500 }
    );
  }
}
