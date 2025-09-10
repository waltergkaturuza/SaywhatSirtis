import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const hasAccess = session.user?.permissions?.includes("documents.view") ||
                     session.user?.permissions?.includes("documents.full_access");

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30d';
    const category = searchParams.get('category') || 'all';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build where clause for filtering
    const whereClause: any = {
      createdAt: {
        gte: startDate
      }
    };

    if (category !== 'all') {
      whereClause.category = {
        contains: category,
        mode: 'insensitive'
      };
    }

    // Get total documents
    const totalDocuments = await prisma.document.count({
      where: whereClause
    });

    // Get total views and downloads
    const documents = await prisma.document.findMany({
      where: whereClause,
      select: {
        id: true,
        originalName: true,
        category: true,
        size: true,
        accessLevel: true,
        createdAt: true
      }
    });

    const totalViews = 0; // Not implemented yet - no viewsCount field
    const totalDownloads = 0; // Not implemented yet - no downloadsCount field
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);

    // Calculate storage in GB
    const storageUsed = Math.round((totalSize / (1024 * 1024 * 1024)) * 100) / 100;

    // Calculate average views per document
    const avgViewsPerDoc = 0; // Not implemented yet

    // Get category distribution
    const categoryGroups = documents.reduce((acc: any, doc) => {
      const cat = doc.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = 0;
      }
      acc[cat]++;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryGroups)
      .map(([name, count]: [string, any]) => ({
        name,
        count,
        percentage: totalDocuments > 0 ? Math.round((count / totalDocuments) * 100 * 100) / 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get security classification distribution (using accessLevel)
    const securityGroups = documents.reduce((acc: any, doc) => {
      const classification = doc.accessLevel || 'INTERNAL';
      if (!acc[classification]) {
        acc[classification] = 0;
      }
      acc[classification]++;
      return acc;
    }, {});

    const securityDistribution = [
      { classification: 'PUBLIC', count: securityGroups.public || 0, color: 'bg-green-500' },
      { classification: 'CONFIDENTIAL', count: securityGroups.confidential || 0, color: 'bg-saywhat-orange' },
      { classification: 'SECRET', count: securityGroups.secret || 0, color: 'bg-saywhat-red' },
      { classification: 'INTERNAL', count: securityGroups.internal || 0, color: 'bg-blue-500' }
    ];

    // Get recent activity (simplified - using creation dates as activity)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayDocuments = documents.filter(doc => 
        doc.createdAt >= dayStart && doc.createdAt < dayEnd
      );

      recentActivity.push({
        date: dayStart.toISOString().split('T')[0],
        views: 0, // Not implemented yet
        uploads: dayDocuments.length,
        downloads: 0 // Not implemented yet
      });
    }

    // Get top documents
    const topDocuments = documents
      .slice(0, 10)
      .map(doc => ({
        name: doc.originalName,
        views: 0, // Not implemented yet
        downloads: 0, // Not implemented yet
        category: doc.category || 'Uncategorized'
      }));

    const analytics = {
      totalDocuments,
      totalViews,
      totalDownloads,
      totalShares: 0, // Not implemented yet
      storageUsed,
      avgViewsPerDoc,
      topCategories,
      securityDistribution,
      recentActivity,
      topDocuments
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching document analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
