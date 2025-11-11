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
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Get the main document
    const mainDocument = await prisma.documents.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        version: true,
        filename: true,
        originalName: true,
        size: true,
        uploadedBy: true,
        versionComment: true,
        createdAt: true,
        updatedAt: true,
        isLatestVersion: true,
        classification: true,
        category: true,
        viewCount: true,
        downloadCount: true,
        path: true,
        parentDocumentId: true
      }
    });

    if (!mainDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get all versions - either this document's children or siblings if this is a child
    let versions: any[] = [];
    
    if (mainDocument.parentDocumentId) {
      // This is a version, get the parent and all siblings
      const parent = await prisma.documents.findUnique({
        where: { id: mainDocument.parentDocumentId },
        select: {
          id: true,
          version: true,
          filename: true,
          originalName: true,
          size: true,
          uploadedBy: true,
          versionComment: true,
          createdAt: true,
          updatedAt: true,
          isLatestVersion: true,
          classification: true,
          category: true,
          viewCount: true,
          downloadCount: true,
          path: true
        }
      });

      const siblings = await prisma.documents.findMany({
        where: {
          parentDocumentId: mainDocument.parentDocumentId,
          isDeleted: false
        },
        select: {
          id: true,
          version: true,
          filename: true,
          originalName: true,
          size: true,
          uploadedBy: true,
          versionComment: true,
          createdAt: true,
          updatedAt: true,
          isLatestVersion: true,
          classification: true,
          category: true,
          viewCount: true,
          downloadCount: true,
          path: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      versions = parent ? [parent, ...siblings] : siblings;
    } else {
      // This is a parent document, get all its versions
      const childVersions = await prisma.documents.findMany({
        where: {
          parentDocumentId: documentId,
          isDeleted: false
        },
        select: {
          id: true,
          version: true,
          filename: true,
          originalName: true,
          size: true,
          uploadedBy: true,
          versionComment: true,
          createdAt: true,
          updatedAt: true,
          isLatestVersion: true,
          classification: true,
          category: true,
          viewCount: true,
          downloadCount: true,
          path: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      versions = [mainDocument, ...childVersions];
    }

    // Enrich with user information
    const enrichedVersions = await Promise.all(
      versions.map(async (version) => {
        let uploadedByUser = null;
        if (version.uploadedBy) {
          try {
            uploadedByUser = await prisma.users.findUnique({
              where: { id: version.uploadedBy },
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            });
          } catch (err) {
            // User not found, skip
          }
        }

        return {
          ...version,
          uploadedByUser,
          createdAt: version.createdAt.toISOString(),
          updatedAt: version.updatedAt.toISOString()
        };
      })
    );

    // Sort by version number (descending)
    enrichedVersions.sort((a, b) => {
      const versionA = parseFloat(a.version);
      const versionB = parseFloat(b.version);
      return versionB - versionA;
    });

    return NextResponse.json({
      success: true,
      versions: enrichedVersions,
      totalVersions: enrichedVersions.length
    });

  } catch (error) {
    console.error('Error fetching version history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version history' },
      { status: 500 }
    );
  }
}

