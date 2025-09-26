import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/database';

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

    // Fetch document from database with retry logic
    const document = await withRetry(async () => {
      return await prisma.documents.findUnique({
        where: {
          id: documentId,
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

  } catch (error: any) {
    console.error('Error fetching document:', error);
    
    // Provide more specific error messages based on error type
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again in a moment.',
          details: 'The database server is temporarily unavailable.'
        },
        { status: 503 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch document',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
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
    
    // Provide specific error messages
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again in a moment.',
          details: 'The database server is temporarily unavailable.'
        },
        { status: 503 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Document not found or could not be updated' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update document',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}