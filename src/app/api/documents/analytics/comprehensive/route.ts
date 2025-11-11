import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '12months';
    const departmentFilter = searchParams.get('department') || 'all';

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '24months':
        startDate.setFullYear(now.getFullYear() - 2);
        break;
      default: // 12months
        startDate.setFullYear(now.getFullYear() - 1);
    }

    // Build filters
    const baseFilter: any = {
      isDeleted: false,
      isPersonalRepo: false,
      createdAt: {
        gte: startDate
      }
    };

    if (departmentFilter !== 'all') {
      baseFilter.department = departmentFilter;
    }

    // Fetch total documents count
    const totalDocuments = await prisma.documents.count({
      where: baseFilter
    });

    // Calculate total size
    const sizeAggregate = await prisma.documents.aggregate({
      where: baseFilter,
      _sum: {
        size: true
      },
      _avg: {
        size: true
      }
    });

    const totalSizeBytes = sizeAggregate._sum.size || 0;
    const avgSizeBytes = sizeAggregate._avg.size || 0;
    const totalSizeGB = (totalSizeBytes / 1024 / 1024 / 1024).toFixed(2);
    const avgSizeMB = (avgSizeBytes / 1024 / 1024).toFixed(2);

    // Get start of current month for monthly stats
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count views this month
    const viewsThisMonth = await prisma.document_audit_logs.count({
      where: {
        action: 'VIEWED',
        timestamp: {
          gte: startOfMonth
        },
        documents: {
          ...baseFilter
        }
      }
    });

    // Count downloads this month
    const downloadsThisMonth = await prisma.document_audit_logs.count({
      where: {
        action: 'DOWNLOADED',
        timestamp: {
          gte: startOfMonth
        },
        documents: {
          ...baseFilter
        }
      }
    });

    // Count favorites
    const favoriteDocuments = await prisma.document_favorites.count({
      where: {
        documents: {
          ...baseFilter
        }
      }
    });

    // Count shared documents (documents with permissions or shares)
    const sharedPermissions = await prisma.document_permissions.groupBy({
      by: ['documentId'],
      where: {
        documents: {
          ...baseFilter
        }
      }
    });

    const sharedShares = await prisma.document_shares.groupBy({
      by: ['documentId'],
      where: {
        isActive: true,
        documents: {
          ...baseFilter
        }
      }
    });

    const sharedDocIds = new Set([
      ...sharedPermissions.map(p => p.documentId),
      ...sharedShares.map(s => s.documentId)
    ]);

    // Calculate growth rate
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - (period === '1month' ? 1 : period === '3months' ? 3 : period === '6months' ? 6 : period === '24months' ? 24 : 12));
    
    const previousPeriodCount = await prisma.documents.count({
      where: {
        ...baseFilter,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const growthRate = previousPeriodCount > 0 
      ? (((totalDocuments - previousPeriodCount) / previousPeriodCount) * 100).toFixed(1)
      : 0;

    const metrics = {
      totalDocuments,
      totalSize: `${totalSizeGB} GB`,
      viewsThisMonth,
      downloadsThisMonth,
      sharedDocuments: sharedDocIds.size,
      favoriteDocuments,
      avgFileSize: `${avgSizeMB} MB`,
      documentGrowthRate: Number(growthRate)
    };

    // Category distribution
    const categoryGroups = await prisma.documents.groupBy({
      by: ['category'],
      where: baseFilter,
      _count: {
        category: true
      },
      _sum: {
        size: true
      }
    });

    const categories: any[] = categoryGroups.map(group => {
      const cat = group.category || 'OTHER';
      const count = group._count.category;
      const size = (group._sum.size || 0) / 1024 / 1024; // Convert to MB
      const percentage = totalDocuments > 0 ? (count / totalDocuments) * 100 : 0;
      const avgSize = count > 0 ? size / count : 0;

      return {
        category: cat,
        count,
        size,
        percentage,
        avgSize
      };
    }).sort((a, b) => b.count - a.count);

    // Department statistics
    const departmentGroups = await prisma.documents.groupBy({
      by: ['department'],
      where: baseFilter,
      _count: {
        department: true
      },
      _sum: {
        size: true,
        viewCount: true,
        downloadCount: true
      }
    });

    const departments: any[] = await Promise.all(
      departmentGroups.map(async (group) => {
        const dept = group.department || 'Unknown';
        
        // Count unique uploaders for this department
        const uniqueUploaders = await prisma.documents.findMany({
          where: {
            ...baseFilter,
            department: dept
          },
          select: {
            uploadedBy: true
          },
          distinct: ['uploadedBy']
        });

        return {
          department: dept,
          documents: group._count.department,
          size: (group._sum.size || 0) / 1024 / 1024, // MB
          views: group._sum.viewCount || 0,
          downloads: group._sum.downloadCount || 0,
          activeUsers: uniqueUploaders.length
        };
      })
    );

    departments.sort((a, b) => b.documents - a.documents);

    // Time series data (monthly uploads/views/downloads)
    const monthsToGenerate = period === '1month' ? 4 : period === '3months' ? 3 : period === '6months' ? 6 : period === '24months' ? 24 : 12;
    const timeSeries: any[] = [];

    for (let i = monthsToGenerate - 1; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const monthFilter = {
        ...baseFilter,
        createdAt: {
          gte: monthDate,
          lt: nextMonth
        }
      };

      const uploads = await prisma.documents.count({ where: monthFilter });
      
      const views = await prisma.document_audit_logs.count({
        where: {
          action: 'VIEWED',
          timestamp: {
            gte: monthDate,
            lt: nextMonth
          },
          documents: {
            ...baseFilter
          }
        }
      });

      const downloads = await prisma.document_audit_logs.count({
        where: {
          action: 'DOWNLOADED',
          timestamp: {
            gte: monthDate,
            lt: nextMonth
          },
          documents: {
            ...baseFilter
          }
        }
      });

      const shares = await prisma.document_audit_logs.count({
        where: {
          action: 'SHARED',
          timestamp: {
            gte: monthDate,
            lt: nextMonth
          },
          documents: {
            ...baseFilter
          }
        }
      });

      timeSeries.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
        uploads,
        views,
        downloads,
        shares
      });
    }

    // Security classification distribution
    const securityGroups = await prisma.documents.groupBy({
      by: ['classification'],
      where: baseFilter,
      _count: {
        classification: true
      }
    });

    const securityClassificationColors: Record<string, string> = {
      'PUBLIC': '#10b981',
      'INTERNAL': '#3b82f6',
      'CONFIDENTIAL': '#f59e0b',
      'SECRET': '#ef4444',
      'TOP_SECRET': '#7c3aed'
    };

    const security = securityGroups.map(group => {
      const classification = group.classification || 'PUBLIC';
      const count = group._count.classification;
      const percentage = totalDocuments > 0 ? (count / totalDocuments) * 100 : 0;

      return {
        classification,
        count,
        percentage,
        color: securityClassificationColors[classification] || '#6b7280'
      };
    }).sort((a, b) => b.count - a.count);

    // User activity (top uploaders)
    const userUploads = await prisma.documents.groupBy({
      by: ['uploadedBy'],
      where: baseFilter,
      _count: {
        uploadedBy: true
      },
      _sum: {
        viewCount: true,
        downloadCount: true
      }
    });

    const userActivity: any[] = await Promise.all(
      userUploads.slice(0, 20).map(async (group) => {
        const userId = group.uploadedBy || 'Unknown';
        
        // Get share count for this user
        const shareCount = await prisma.document_audit_logs.count({
          where: {
            userId,
            action: 'SHARED',
            timestamp: {
              gte: startDate
            }
          }
        });

        // Try to get user name
        let userName = userId;
        try {
          const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true, email: true }
          });
          if (user) {
            userName = `${user.firstName} ${user.lastName}`;
          }
        } catch (err) {
          // Use ID if user not found
        }

        return {
          user: userName,
          uploads: group._count.uploadedBy,
          views: group._sum.viewCount || 0,
          downloads: group._sum.downloadCount || 0,
          shares: shareCount
        };
      })
    );

    userActivity.sort((a, b) => b.uploads - a.uploads);

    return NextResponse.json({
      success: true,
      metrics,
      categories,
      departments,
      timeSeries,
      security,
      userActivity
    });

  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

