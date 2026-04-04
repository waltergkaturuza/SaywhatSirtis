import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { createErrorResponse } from '@/lib/error-handler';
import { enrichDocumentDetailJson } from '@/lib/documents/enrich-document-detail';

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

    // Same Prisma client as GET /api/documents list; include project name for parity with list mapper
    const document = await withRetry(async () => {
      return await prisma.documents.findUnique({
        where: { id: documentId },
        include: {
          projects: { select: { name: true } },
        },
      });
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch user information if uploadedBy is available
    let uploadedByUser = null;
    if (document.uploadedBy) {
      try {
        uploadedByUser = await withRetry(async () => {
          return await prisma.users.findUnique({
            where: { id: document.uploadedBy! },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          });
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    // Match list route: any authenticated user with document access permissions can view
    const hasListAccess =
      session.user?.permissions?.includes('documents.view') ||
      session.user?.permissions?.includes('documents.full_access') ||
      session.user?.permissions?.includes('documents') ||
      session.user?.permissions?.includes('documents_view') ||
      session.user?.permissions?.includes('documents_edit') ||
      session.user?.roles?.some((role: string) =>
        ['admin', 'manager', 'advance_user_1', 'advance_user_2', 'basic_user_1', 'basic_user_2', 'hr'].includes(
          role.toLowerCase()
        )
      ) ||
      Boolean(session.user);

    const hasAccess =
      document.isPublic ||
      document.uploadedBy === session.user?.id ||
      session.user?.roles?.includes('admin') ||
      session.user?.permissions?.includes('documents.admin') ||
      hasListAccess;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(enrichDocumentDetailJson(document, uploadedByUser));

  } catch (error: any) {
    console.error('Error fetching document:', error);
    return createErrorResponse(error, request.url)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = await params;
    const updateData = await request.json();

    // First check if document exists and user has permission to edit
    const existingDocument = await withRetry(async () => {
      return await prisma.documents.findUnique({
        where: { id: documentId },
      });
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has permission to edit
    const canEdit = 
      existingDocument.uploadedBy === session.user.id ||
      session.user.roles?.includes('admin') ||
      session.user.permissions?.includes('documents.admin') ||
      session.user.permissions?.includes('documents.edit');

    if (!canEdit) {
      return NextResponse.json({ error: 'Permission denied to edit this document' }, { status: 403 });
    }

    // Update the document with retry logic
    const updatedDocument = await withRetry(async () => {
      return await prisma.documents.update({
        where: { id: documentId },
        data: {
          filename: updateData.filename || existingDocument.filename,
          category: updateData.category || existingDocument.category,
          classification: updateData.classification || existingDocument.classification,
          description: updateData.description !== undefined ? updateData.description : existingDocument.description,
          tags: updateData.tags || existingDocument.tags,
          isPublic: updateData.isPublic !== undefined ? updateData.isPublic : existingDocument.isPublic,
          customMetadata: updateData.customMetadata || existingDocument.customMetadata,
          updatedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });

  } catch (error: any) {
    console.error('Error updating document:', error);
    return createErrorResponse(error, request.url)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: documentId } = await params;

    const existingDocument = await withRetry(async () => {
      return await prisma.documents.findUnique({
        where: { id: documentId },
      });
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const canDelete =
      existingDocument.uploadedBy === session.user?.id ||
      session.user?.roles?.includes('admin') ||
      session.user?.permissions?.includes('documents.full_access');

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await withRetry(async () => {
      await prisma.documents.delete({
        where: { id: documentId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return createErrorResponse(error, request.url)
  }
}