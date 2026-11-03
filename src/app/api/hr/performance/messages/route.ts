import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canViewAllPerformance } from '@/lib/hr/performance-access'
import { randomUUID } from 'crypto'

const CHANNEL = 'performance-chat'

type Topic = 'plan' | 'appraisal'

function topicType(topic: Topic) {
  return topic === 'appraisal' ? 'APPRAISAL' : 'PERFORMANCE_PLAN'
}

function topicTitle(topic: Topic) {
  return topic === 'appraisal' ? 'Appraisal message' : 'Performance plan message'
}

function asMeta(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

async function currentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, roles: true }
  })
  if (!user) return null
  const canSend = canViewAllPerformance(user, {
    user: {
      roles: (session.user as { roles?: string[] }).roles,
      permissions: (session.user as { permissions?: string[] }).permissions
    }
  })
  return { user, canSend }
}

export async function GET(request: NextRequest) {
  try {
    const actor = await currentUser()
    if (!actor) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const topic = request.nextUrl.searchParams.get('topic') === 'appraisal' ? 'appraisal' : 'plan'
    const lookups = request.nextUrl.searchParams.get('lookups') === '1'

    let directory: { employees: Array<{ id: string; name: string; department: string }>; departments: string[] } | undefined
    if (lookups && actor.canSend) {
      const people = await prisma.employees.findMany({
        where: { status: { in: ['ACTIVE', 'ON_LEAVE'] } },
        select: { id: true, firstName: true, lastName: true, department: true, email: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      })
      const departments = Array.from(new Set(people.map((person) => person.department).filter((name): name is string => Boolean(name)))).sort()
      directory = {
        departments,
        employees: people.map((person) => ({
          id: person.id,
          name: `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.email,
          department: person.department || 'Not assigned'
        }))
      }
    }

    const rows = await prisma.notifications.findMany({
      where: {
        type: topicType(topic),
        AND: [
          { metadata: { path: ['channel'], equals: CHANNEL } },
          { metadata: { path: ['topic'], equals: topic } },
          ...(actor.canSend
            ? []
            : [{
                OR: [
                  { recipientId: actor.user.id },
                  { userId: actor.user.id },
                  { senderId: actor.user.id }
                ]
              }])
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        users_notifications_senderIdTousers: {
          select: { id: true, firstName: true, lastName: true }
        },
        employees: {
          select: { id: true, firstName: true, lastName: true, department: true, email: true }
        }
      }
    })

    const threads = new Map<string, {
      threadId: string
      title: string
      employeeName: string
      department: string
      updatedAt: string
      unread: number
      messages: Array<{ id: string; body: string; senderId: string | null; senderName: string; mine: boolean; createdAt: string }>
    }>()

    for (const row of rows) {
      const meta = asMeta(row.metadata)
      const threadId = typeof meta.threadId === 'string' ? meta.threadId : row.id
      const sender = row.users_notifications_senderIdTousers
      const senderName = sender
        ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'HR'
        : 'HR'
      const employeeName = row.employees
        ? `${row.employees.firstName || ''} ${row.employees.lastName || ''}`.trim() || row.employees.email
        : 'Employee'
      const existing = threads.get(threadId) || {
        threadId,
        title: row.title,
        employeeName,
        department: row.employees?.department || '',
        updatedAt: row.createdAt.toISOString(),
        unread: 0,
        messages: []
      }
      existing.title = row.title || existing.title
      existing.updatedAt = row.createdAt.toISOString()
      if (!row.isRead && (row.recipientId === actor.user.id || row.userId === actor.user.id) && row.senderId !== actor.user.id) {
        existing.unread += 1
      }
      existing.messages.push({
        id: row.id,
        body: row.message,
        senderId: row.senderId,
        senderName,
        mine: row.senderId === actor.user.id,
        createdAt: row.createdAt.toISOString()
      })
      threads.set(threadId, existing)
    }

    const list = Array.from(threads.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    return NextResponse.json({
      success: true,
      canSend: actor.canSend,
      threads: list,
      directory
    })
  } catch (error) {
    console.error('Failed to load performance messages:', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await currentUser()
    if (!actor) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const action = typeof body.action === 'string' ? body.action : 'send'
    const topic: Topic = body.topic === 'appraisal' ? 'appraisal' : 'plan'

    if (action === 'read') {
      const threadId = typeof body.threadId === 'string' ? body.threadId : ''
      if (!threadId) return NextResponse.json({ error: 'Missing conversation' }, { status: 400 })
      await prisma.notifications.updateMany({
        where: {
          AND: [
            { metadata: { path: ['channel'], equals: CHANNEL } },
            { metadata: { path: ['threadId'], equals: threadId } },
            { OR: [{ recipientId: actor.user.id }, { userId: actor.user.id }] }
          ]
        },
        data: { isRead: true, updatedAt: new Date() }
      })
      return NextResponse.json({ success: true })
    }

    const message = typeof body.message === 'string' ? body.message.trim() : ''
    if (!message || message.length > 2000) {
      return NextResponse.json({ error: 'Write a message of up to 2000 characters' }, { status: 400 })
    }

    const threadId = typeof body.threadId === 'string' ? body.threadId : ''
    if (threadId) {
      const existing = await prisma.notifications.findMany({
        where: {
          AND: [
            { metadata: { path: ['channel'], equals: CHANNEL } },
            { metadata: { path: ['threadId'], equals: threadId } }
          ]
        },
        orderBy: { createdAt: 'asc' }
      })
      if (existing.length === 0) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      const involved = existing.some((row) => row.senderId === actor.user.id || row.recipientId === actor.user.id || row.userId === actor.user.id)
      if (!involved && !actor.canSend) {
        return NextResponse.json({ error: 'You cannot reply to this conversation' }, { status: 403 })
      }
      const opening = existing[0]
      const employeeUserId = opening.recipientId || opening.userId
      const targetUserId = actor.user.id === employeeUserId ? opening.senderId : employeeUserId
      if (!targetUserId || targetUserId === actor.user.id) {
        return NextResponse.json({ error: 'Nobody to reply to' }, { status: 400 })
      }
      await prisma.notifications.create({
        data: {
          id: randomUUID(),
          userId: targetUserId,
          recipientId: targetUserId,
          employeeId: opening.employeeId,
          senderId: actor.user.id,
          title: opening.title,
          message,
          type: opening.type,
          isRead: false,
          status: 'sent',
          sentAt: new Date(),
          priority: 'normal',
          actionUrl: topic === 'appraisal' ? '/hr/performance/appraisals?tab=notifications' : '/hr/performance/plans?tab=notifications',
          metadata: { channel: CHANNEL, topic, threadId, kind: 'reply' }
        }
      })
      return NextResponse.json({ success: true, threadId })
    }

    if (!actor.canSend) {
      return NextResponse.json({ error: 'Only HR can start a message' }, { status: 403 })
    }

    const audience = body.audience === 'department' || body.audience === 'selected' ? body.audience : 'all'
    const department = typeof body.department === 'string' ? body.department.trim() : ''
    const employeeIds = Array.isArray(body.employeeIds) ? body.employeeIds.filter((id: unknown) => typeof id === 'string') : []
    if (audience === 'department' && !department) {
      return NextResponse.json({ error: 'Choose a department' }, { status: 400 })
    }
    if (audience === 'selected' && employeeIds.length === 0) {
      return NextResponse.json({ error: 'Choose at least one person' }, { status: 400 })
    }

    const people = await prisma.employees.findMany({
      where: {
        status: { in: ['ACTIVE', 'ON_LEAVE'] },
        ...(audience === 'department' ? { department } : {}),
        ...(audience === 'selected' ? { id: { in: employeeIds } } : {})
      },
      select: { id: true, userId: true }
    })
    const recipients = people.filter((person) => person.userId && person.userId !== actor.user.id)
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No employees matched that selection' }, { status: 400 })
    }

    const title = (typeof body.title === 'string' ? body.title.trim() : '') || topicTitle(topic)
    const actionUrl = topic === 'appraisal' ? '/hr/performance/appraisals?tab=notifications' : '/hr/performance/plans?tab=notifications'
    await prisma.notifications.createMany({
      data: recipients.map((person) => ({
        id: randomUUID(),
        userId: person.userId,
        recipientId: person.userId,
        employeeId: person.id,
        senderId: actor.user.id,
        title: title.slice(0, 180),
        message,
        type: topicType(topic),
        isRead: false,
        status: 'sent',
        sentAt: new Date(),
        priority: 'normal',
        actionUrl,
        metadata: {
          channel: CHANNEL,
          topic,
          threadId: randomUUID(),
          kind: 'message'
        }
      }))
    })

    return NextResponse.json({ success: true, sent: recipients.length })
  } catch (error) {
    console.error('Failed to send performance message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
