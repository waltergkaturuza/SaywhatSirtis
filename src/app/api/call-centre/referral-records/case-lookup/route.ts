import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUseCallCentre } from '@/lib/call-centre/referral-store'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canUseCallCentre(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const caseNumber = new URL(request.url).searchParams.get('caseNumber')?.trim()
  if (!caseNumber) return NextResponse.json({ error: 'Enter a case number' }, { status: 400 })

  try {
    const record = await prisma.call_records.findUnique({
      where: { caseNumber },
      select: {
        caseNumber: true,
        clientName: true,
        callerName: true,
        callerPhone: true,
        clientAge: true,
        callerAge: true,
        clientSex: true,
        callerGender: true,
        clientProvince: true,
        callerProvince: true,
        servicesRecommended: true,
        subject: true
      }
    })

    if (!record) return NextResponse.json({ error: 'No call-centre case has that number' }, { status: 404 })

    return NextResponse.json({
      success: true,
      case: {
        caseNumber: record.caseNumber,
        clientName: record.clientName || record.callerName || '',
        clientPhone: record.callerPhone || '',
        clientAge: record.clientAge || record.callerAge || '',
        clientGender: record.clientSex || record.callerGender || '',
        clientProvince: record.clientProvince || record.callerProvince || '',
        servicesRequested: record.servicesRecommended || '',
        subject: record.subject || ''
      }
    })
  } catch (error) {
    console.error('Error looking up case for referral:', error)
    return NextResponse.json({ error: 'Unable to look up that case' }, { status: 500 })
  }
}
