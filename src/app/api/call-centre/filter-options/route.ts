import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';

export async function GET(request: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('Database connection failed in call centre filter options API');
      return NextResponse.json(
        { error: 'Database connection unavailable', code: 'DB_CONNECTION_FAILED' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasPermission =
      session.user.permissions?.includes('callcentre.access') ||
      session.user.permissions?.includes('calls.view') ||
      session.user.permissions?.includes('calls.full_access') ||
      session.user.roles?.some((role) =>
        ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase())
      );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch distinct values from call_records for filter options
    const [
      officersResult,
      provincesResult,
      statusesResult,
      validityResult,
      communicationModesResult,
    ] = await Promise.all([
      // Get distinct officers from call_records
      prisma.call_records.findMany({
        where: {
          officerName: {
            not: null,
          },
        },
        select: {
          officerName: true,
        },
        distinct: ['officerName'],
        orderBy: {
          officerName: 'asc',
        },
      }),

      // Get distinct provinces from call_records
      prisma.call_records.findMany({
        where: {
          callerProvince: {
            not: null,
          },
        },
        select: {
          callerProvince: true,
        },
        distinct: ['callerProvince'],
        orderBy: {
          callerProvince: 'asc',
        },
      }),

      // Get distinct statuses from call_records
      prisma.call_records.findMany({
        where: {
          status: {
            not: null,
          },
        },
        select: {
          status: true,
        },
        distinct: ['status'],
        orderBy: {
          status: 'asc',
        },
      }),

      // Get distinct validity values from call_records
      prisma.call_records.findMany({
        where: {
          callValidity: {
            not: null,
          },
        },
        select: {
          callValidity: true,
        },
        distinct: ['callValidity'],
        orderBy: {
          callValidity: 'asc',
        },
      }),

      // Get distinct communication modes from call_records
      prisma.call_records.findMany({
        where: {
          modeOfCommunication: {
            not: null,
          },
        },
        select: {
          modeOfCommunication: true,
        },
        distinct: ['modeOfCommunication'],
        orderBy: {
          modeOfCommunication: 'asc',
        },
      }),
    ]);

    // Transform the results into arrays of strings
    const officers = officersResult
      .map((r) => r.officerName)
      .filter((name): name is string => name !== null && name !== 'N/A')
      .sort();

    const provinces = provincesResult
      .map((r) => r.callerProvince)
      .filter((province): province is string => province !== null && province !== 'N/A')
      .sort();

    const statuses = statusesResult
      .map((r) => r.status)
      .filter((status): status is string => status !== null)
      .sort();

    const validityOptions = validityResult
      .map((r) => r.callValidity)
      .filter((validity): validity is string => validity !== null && validity !== 'N/A')
      .sort();

    const communicationModes = communicationModesResult
      .map((r) => r.modeOfCommunication)
      .filter((mode): mode is string => mode !== null && mode !== 'N/A')
      .sort();

    return NextResponse.json({
      success: true,
      filterOptions: {
        officers,
        provinces,
        statuses,
        validity: validityOptions,
        communicationModes,
      },
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch filter options',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

