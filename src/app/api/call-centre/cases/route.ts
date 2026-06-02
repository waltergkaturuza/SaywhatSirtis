import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';

const TAB_STATUS_MAP: Record<string, string[] | null> = {
  all: null,
  open: ['OPEN'],
  'in-progress': ['IN_PROGRESS'],
  pending: ['PENDING'],
  closed: ['CLOSED', 'RESOLVED'],
};

function normalizeStatus(status?: string | null) {
  return (status || 'OPEN').toLowerCase().replace('_', '-');
}

function transformCallToCase(call: {
  id: string;
  caseNumber: string | null;
  callNumber: string | null;
  callerName: string | null;
  callerPhone: string | null;
  summary: string | null;
  purpose: string | null;
  assignedOfficer: string | null;
  status: string | null;
  priority: string | null;
  callStartTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
  description: string | null;
}) {
  const now = new Date();
  const referenceDate = call.callStartTime ?? call.createdAt;
  const createdDate = new Date(referenceDate);
  const dueDate = new Date(createdDate);
  dueDate.setDate(dueDate.getDate() + 7);

  const dbStatus = (call.status || 'OPEN').toUpperCase();

  return {
    id: call.id,
    caseNumber: call.caseNumber,
    callNumber: call.callNumber || call.id,
    clientName: call.callerName,
    phone: call.callerPhone,
    purpose: call.summary || call.purpose || 'General Inquiry',
    officer: call.assignedOfficer,
    status: normalizeStatus(call.status),
    priority: (call.priority || 'MEDIUM').toLowerCase(),
    createdDate: createdDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    lastUpdate: call.updatedAt.toISOString().split('T')[0],
    isOverdue: now > dueDate && !['CLOSED', 'RESOLVED'].includes(dbStatus),
    description: call.notes || call.description || 'No description available',
  };
}

function buildBaseConditions(searchParams: URLSearchParams) {
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const officer = searchParams.get('officer');
  const province = searchParams.get('province');
  const priority = searchParams.get('priority');
  const search = searchParams.get('search');

  const andConditions: Record<string, unknown>[] = [
    {
      OR: [{ isCase: 'YES' }, { assignedOfficer: { not: null } }],
    },
  ];

  if (officer && officer !== 'all') {
    andConditions.push({ assignedOfficer: officer });
  }
  if (province) {
    andConditions.push({ callerProvince: province });
  }
  if (priority) {
    andConditions.push({ priority: priority.toUpperCase() });
  }
  if (search) {
    andConditions.push({
      OR: [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { callerName: { contains: search, mode: 'insensitive' } },
        { callerPhone: { contains: search } },
        { purpose: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ],
    });
  }
  if (dateFrom || dateTo) {
    const dateRange: { gte?: Date; lte?: Date } = {};
    if (dateFrom) dateRange.gte = new Date(dateFrom);
    if (dateTo) dateRange.lte = new Date(`${dateTo}T23:59:59.999`);
    andConditions.push({
      OR: [
        { callStartTime: { not: null, ...dateRange } },
        { callStartTime: null, createdAt: dateRange },
      ],
    });
  }

  return andConditions;
}

function buildTabCondition(tab: string) {
  const tabStatuses = TAB_STATUS_MAP[tab];
  if (tabStatuses) {
    return [{ status: { in: tabStatuses } }];
  }
  if (tab === 'overdue') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return [
      { status: { notIn: ['CLOSED', 'RESOLVED'] } },
      {
        OR: [
          { callStartTime: { lt: sevenDaysAgo } },
          { callStartTime: null, createdAt: { lt: sevenDaysAgo } },
        ],
      },
    ];
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Database connection failed in call centre cases API');
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission =
      session.user.permissions?.includes('calls.view') ||
      session.user.permissions?.includes('calls.full_access') ||
      session.user.permissions?.includes('call_center_full') ||
      session.user.permissions?.includes('callcentre.access') ||
      session.user.permissions?.includes('callcentre.officer') ||
      session.user.roles?.some((role) =>
        ['admin', 'manager', 'super_user', 'advance_user_1'].includes(role.toLowerCase())
      );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '500'), 1000);
    const skip = (page - 1) * limit;

    const tab = searchParams.get('tab') || 'all';
    const baseConditions = buildBaseConditions(searchParams);
    const tabConditions = buildTabCondition(tab);
    const where = { AND: [...baseConditions, ...tabConditions] };
    const statsWhere = { AND: baseConditions };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const selectFields = {
      id: true,
      caseNumber: true,
      callNumber: true,
      callerName: true,
      callerPhone: true,
      summary: true,
      purpose: true,
      assignedOfficer: true,
      status: true,
      priority: true,
      callStartTime: true,
      createdAt: true,
      updatedAt: true,
      notes: true,
      description: true,
    };

    const [calls, totalCount, totalAllCount, openCount, inProgressCount, pendingCount, closedCount, overdueCount] =
      await Promise.all([
        prisma.call_records.findMany({
          where,
          select: selectFields,
          orderBy: [{ callStartTime: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: limit,
        }),
        prisma.call_records.count({ where }),
        prisma.call_records.count({ where: statsWhere }),
        prisma.call_records.count({ where: { AND: [...baseConditions, { status: 'OPEN' }] } }),
        prisma.call_records.count({
          where: { AND: [...baseConditions, { status: 'IN_PROGRESS' }] },
        }),
        prisma.call_records.count({
          where: { AND: [...baseConditions, { status: 'PENDING' }] },
        }),
        prisma.call_records.count({
          where: { AND: [...baseConditions, { status: { in: ['CLOSED', 'RESOLVED'] } }] },
        }),
        prisma.call_records.count({
          where: {
            AND: [
              ...baseConditions,
              { status: { notIn: ['CLOSED', 'RESOLVED'] } },
              {
                OR: [
                  { callStartTime: { lt: sevenDaysAgo } },
                  { callStartTime: null, createdAt: { lt: sevenDaysAgo } },
                ],
              },
            ],
          },
        }),
      ]);

    const cases = calls.map(transformCallToCase);

    return NextResponse.json({
      success: true,
      cases,
      total: totalCount,
      page,
      limit,
      stats: {
        totalCases: totalAllCount,
        openCases: openCount,
        inProgressCases: inProgressCount,
        pendingCases: pendingCount,
        closedCases: closedCount,
        overdueCases: overdueCount,
      },
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cases',
        details: error instanceof Error ? { name: error.name, message: error.message } : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
