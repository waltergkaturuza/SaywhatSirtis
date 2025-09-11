import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('documents.view') ||
                         session.user?.permissions?.includes('documents.full_access') ||
                         session.user?.roles?.includes('admin')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get total document count
    const totalDocuments = await prisma.document.count({
      where: {
        isDeleted: false
      }
    });

    // Calculate total storage used
    const storageResult = await prisma.document.aggregate({
      where: {
        isDeleted: false
      },
      _sum: {
        size: true
      }
    });

    const totalBytes = storageResult._sum.size || 0;
    const storageUsed = formatFileSize(totalBytes);

    // Get this month's view count
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const viewsThisMonth = await prisma.document.aggregate({
      where: {
        isDeleted: false,
        lastAccessedAt: {
          gte: thisMonth
        }
      },
      _sum: {
        viewCount: true
      }
    });

    // Get shared documents count (this would need DocumentShare model)
    // For now, return 0
    const sharedWithMe = 0;

    return NextResponse.json({
      totalDocuments,
      storageUsed,
      viewsThisMonth: viewsThisMonth._sum.viewCount || 0,
      sharedWithMe
    });

  } catch (error) {
    console.error('Error fetching document analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 MB';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}