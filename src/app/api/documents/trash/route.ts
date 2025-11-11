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

    // Fetch deleted documents
    const deletedDocuments = await prisma.documents.findMany({
      where: {
        isDeleted: true,
        isPersonalRepo: false
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        category: true,
        classification: true,
        department: true,
        uploadedBy: true,
        deletedAt: true,
        deletedBy: true,
        createdAt: true,
        updatedAt: true,
        folderPath: true
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // Enrich with user information
    const enrichedDocuments = await Promise.all(
      deletedDocuments.map(async (doc) => {
        let uploaderName = doc.uploadedBy || 'Unknown';
        if (doc.uploadedBy) {
          try {
            const uploader = await prisma.users.findUnique({
              where: { id: doc.uploadedBy },
              select: { firstName: true, lastName: true }
            });
            if (uploader) {
              uploaderName = `${uploader.firstName} ${uploader.lastName}`;
            }
          } catch (err) {
            // User not found
          }
        }

        return {
          id: doc.id,
          title: doc.originalName,
          fileName: doc.filename,
          type: doc.mimeType?.split('/')[1] || 'file',
          mimeType: doc.mimeType,
          size: doc.size,
          category: doc.category,
          classification: doc.classification,
          department: doc.department,
          uploadedBy: uploaderName,
          deletedBy: doc.deletedBy || 'Unknown',
          uploadDate: doc.createdAt.toISOString(),
          modifiedAt: doc.deletedAt?.toISOString() || doc.updatedAt.toISOString(),
          createdAt: doc.createdAt.toISOString()
        };
      })
    );

    return NextResponse.json({
      success: true,
      documents: enrichedDocuments,
      count: enrichedDocuments.length
    });

  } catch (error) {
    console.error('Error fetching trash:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted documents' },
      { status: 500 }
    );
  }
}

