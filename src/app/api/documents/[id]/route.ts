import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Fetch document from database
    const document = await prisma.documents.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch user information if uploadedBy is available
    let uploadedByUser = null;
    if (document.uploadedBy) {
      try {
        uploadedByUser = await prisma.users.findUnique({
          where: { id: document.uploadedBy },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    // Check if user has access to this document
    const hasAccess = 
      document.isPublic ||
      document.uploadedBy === session.user.id ||
      session.user.roles?.includes('admin') ||
      session.user.permissions?.includes('documents.admin') ||
      session.user.permissions?.includes('documents.view');

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return document details
    return NextResponse.json({
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      category: document.category,
      classification: document.classification,
      description: document.description,
      tags: document.tags,
      isPublic: document.isPublic,
      uploadedBy: document.uploadedBy,
      uploadedByUser: uploadedByUser,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      customMetadata: document.customMetadata,
      url: document.url,
      path: document.path,
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}