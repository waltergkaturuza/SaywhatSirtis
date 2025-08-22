import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has call centre access
    if (!session.user.permissions?.includes('callcentre.access')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get call centre records with basic stats
    const totalCalls = await prisma.callCentreRecord.count();
    
    const validCalls = await prisma.callCentreRecord.count({
      where: {
        // Most calls are considered valid unless specifically marked invalid
        status: {
          not: 'CLOSED' // Using a valid CallStatus value
        }
      }
    });

    const totalCases = await prisma.callCentreRecord.count({
      where: {
        assignedTo: {
          not: null
        }
      }
    });

    const pendingCases = await prisma.callCentreRecord.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        },
        assignedTo: {
          not: null
        }
      }
    });

    const closedCases = await prisma.callCentreRecord.count({
      where: {
        status: 'CLOSED',
        assignedTo: {
          not: null
        }
      }
    });

    // Get officer performance data - simplified approach
    const callsGroupedByOfficer = await prisma.callCentreRecord.groupBy({
      by: ['assignedTo'],
      where: {
        assignedTo: {
          not: null
        }
      },
      _count: {
        id: true
      }
    });

    // Get officer names for the grouped data
    const officerIds = callsGroupedByOfficer.map(group => group.assignedTo).filter(Boolean);
    const officers = await prisma.user.findMany({
      where: {
        id: {
          in: officerIds as string[]
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const officerPerformance = callsGroupedByOfficer.map(group => {
      const officer = officers.find(o => o.id === group.assignedTo);
      return {
        name: officer?.name || 'Unknown Officer',
        totalCalls: group._count.id,
        validCalls: group._count.id, // Simplified - assume most are valid
        cases: group._count.id,
        pendingCases: 0, // Would need more complex query
        closedCases: 0, // Would need more complex query
        overdueCases: 0, // Would need additional logic
        avgCallDuration: "N/A" // Would need call duration tracking
      };
    });

    const summaryStats = {
      totalCalls,
      validCalls,
      invalidCalls: totalCalls - validCalls,
      totalCases,
      pendingCases,
      closedCases,
      overdueCases: 0, // Would need additional logic
      averageCallDuration: "N/A", // Would need call duration tracking
      caseConversionRate: totalCalls > 0 ? ((totalCases / totalCalls) * 100).toFixed(1) + "%" : "0%"
    };

    // Get cases by purpose - since we don't have purpose field yet, return empty for now
    const casesByPurpose: Array<{purpose: string, count: number, percentage: number}> = [];

    // Get calls by province - since we don't have province field yet, return empty for now  
    const callsByProvince: Array<{province: string, calls: number, validCalls: number}> = [];

    return NextResponse.json({
      success: true,
      stats: summaryStats,
      officers: officerPerformance,
      casesByPurpose,
      callsByProvince
    });

  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500 }
    );
  }
}
