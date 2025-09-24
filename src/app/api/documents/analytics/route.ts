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

    // Get total document count with safe query
    const totalDocuments = await prisma.documents.count().catch(() => 0);

    // Calculate total storage used with safe query
    const storageResult = await prisma.documents.aggregate({
      _sum: {
        size: true
      }
    }).catch(() => ({ _sum: { size: 0 } }));

    const totalBytes = storageResult._sum.size || 0;
    const storageUsed = formatFileSize(totalBytes);

    // Return safe analytics data
    return NextResponse.json({
      totalDocuments,
      storageUsed,
      viewsThisMonth: 0, // Set to 0 until we implement view tracking
      sharedWithMe: 0   // Set to 0 until we implement sharing
    });

  } catch (error) {
    console.error('Error fetching document analytics:', error);
    // Return safe fallback data instead of error
    return NextResponse.json({
      totalDocuments: 0,
      storageUsed: '0 MB',
      viewsThisMonth: 0,
      sharedWithMe: 0
    });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 MB';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
