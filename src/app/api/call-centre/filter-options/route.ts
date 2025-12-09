import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db-connection';

// In-memory cache with TTL (5 minutes)
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache first - return immediately if cached (no DB query needed)
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        filterOptions: cache.data,
        cached: true,
      });
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

    // Removed checkDatabaseConnection() - it adds an extra query and connection overhead
    // The raw SQL queries will fail gracefully if DB is unavailable

    // Use optimized raw SQL queries with DISTINCT - much faster than Prisma's distinct
    // These queries use indexes and are optimized by the database
    const [
      officersResult,
      provincesResult,
      statusesResult,
      validityResult,
      communicationModesResult,
    ] = await Promise.all([
      // Get distinct officers using raw SQL (faster)
      prisma.$queryRaw<Array<{ officerName: string }>>`
        SELECT DISTINCT "officerName" as "officerName"
        FROM call_records
        WHERE "officerName" IS NOT NULL 
          AND "officerName" != 'N/A'
        ORDER BY "officerName" ASC
        LIMIT 100
      `,

      // Get distinct provinces using raw SQL
      prisma.$queryRaw<Array<{ callerProvince: string }>>`
        SELECT DISTINCT "callerProvince" as "callerProvince"
        FROM call_records
        WHERE "callerProvince" IS NOT NULL 
          AND "callerProvince" != 'N/A'
        ORDER BY "callerProvince" ASC
        LIMIT 50
      `,

      // Get distinct statuses using raw SQL
      prisma.$queryRaw<Array<{ status: string }>>`
        SELECT DISTINCT status
        FROM call_records
        WHERE status IS NOT NULL
        ORDER BY status ASC
        LIMIT 20
      `,

      // Get distinct validity values using raw SQL
      prisma.$queryRaw<Array<{ callValidity: string }>>`
        SELECT DISTINCT "callValidity" as "callValidity"
        FROM call_records
        WHERE "callValidity" IS NOT NULL 
          AND "callValidity" != 'N/A'
        ORDER BY "callValidity" ASC
        LIMIT 10
      `,

      // Get distinct communication modes using raw SQL
      prisma.$queryRaw<Array<{ modeOfCommunication: string }>>`
        SELECT DISTINCT "modeOfCommunication" as "modeOfCommunication"
        FROM call_records
        WHERE "modeOfCommunication" IS NOT NULL 
          AND "modeOfCommunication" != 'N/A'
        ORDER BY "modeOfCommunication" ASC
        LIMIT 20
      `,
    ]);

    // Transform the results into arrays of strings
    const officers = officersResult
      .map((r) => r.officerName)
      .filter((name): name is string => name !== null && name !== 'N/A');

    const provinces = provincesResult
      .map((r) => r.callerProvince)
      .filter((province): province is string => province !== null && province !== 'N/A');

    const statuses = statusesResult
      .map((r) => r.status)
      .filter((status): status is string => status !== null);

    const validityOptions = validityResult
      .map((r) => r.callValidity)
      .filter((validity): validity is string => validity !== null && validity !== 'N/A');

    const communicationModes = communicationModesResult
      .map((r) => r.modeOfCommunication)
      .filter((mode): mode is string => mode !== null && mode !== 'N/A');

    const filterOptions = {
      officers,
      provinces,
      statuses,
      validity: validityOptions,
      communicationModes,
    };

    // Update cache
    cache = {
      data: filterOptions,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      filterOptions,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    
    // Return cached data if available, even if expired, as fallback
    if (cache) {
      console.warn('Returning stale cache due to error');
      return NextResponse.json({
        success: true,
        filterOptions: cache.data,
        cached: true,
        warning: 'Using cached data due to query error',
      });
    }

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

