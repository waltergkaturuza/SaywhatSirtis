import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch user's personal documents (drafts)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userEmail = session.user.email;
    
    // Get personal documents (drafts in personal repo) with retry logic
    const personalDocuments = await withRetry(async () => {
      return await prisma.documents.findMany({
        where: {
          uploadedBy: session.user.name || userEmail,
          isPersonalRepo: true,
          isDeleted: false
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          category: true,
          classification: true,
          department: true,
          approvalStatus: true,
          createdAt: true,
          updatedAt: true,
          size: true,
          description: true,
          uploadedBy: true,
          folderPath: true
        }
      });
    });

    return NextResponse.json({
      success: true,
      documents: personalDocuments,
      count: personalDocuments.length
    });

  } catch (error) {
    console.error('Error fetching personal documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Publish document from personal repo to main repository
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { documentId, action } = await request.json();

    if (!documentId || !action) {
      return NextResponse.json(
        { error: 'Document ID and action are required' },
        { status: 400 }
      );
    }

    // Verify document belongs to user
    const document = await withRetry(async () => {
      return await prisma.documents.findFirst({
        where: {
          id: documentId,
          uploadedBy: session.user.name || session.user.email,
          isPersonalRepo: true,
          isDeleted: false
        }
      });
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    let updateData = {};

    switch (action) {
      case 'publish':
        updateData = {
          isPersonalRepo: false,
          approvalStatus: 'PENDING_REVIEW',
          publishedAt: new Date()
        };
        break;
      
      case 'submit_for_approval':
        updateData = {
          approvalStatus: 'PENDING_APPROVAL'
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update document
    const updatedDocument = await withRetry(async () => {
      return await prisma.documents.update({
        where: { id: documentId },
        data: updateData
      });
    });

    // Create audit log entry
    await withRetry(async () => {
      return await prisma.document_audit_logs.create({
        data: {
          id: uuidv4(), // Generate unique ID
          documentId: documentId,
          userId: session.user.id || session.user.email || 'system',
          userEmail: session.user.email || null,
          action: action === 'publish' ? 'APPROVED' : 'EDITED',
          details: `Document ${action === 'publish' ? 'published to main repository' : 'submitted for approval'}`,
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Document ${action === 'publish' ? 'published' : 'submitted for approval'} successfully`,
      document: {
        id: updatedDocument.id,
        status: updatedDocument.approvalStatus,
        isPersonalRepo: updatedDocument.isPersonalRepo
      }
    });

  } catch (error) {
    console.error('Error updating document status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete document from personal repository
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify document belongs to user and is in personal repo
    const document = await prisma.documents.findFirst({
      where: {
        id: documentId,
        uploadedBy: session.user.name || session.user.email,
        isPersonalRepo: true,
        isDeleted: false
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or cannot be deleted (may already be published)' },
        { status: 404 }
      );
    }

    // Soft delete the document
    // Update document (soft delete)
    await withRetry(async () => {
      return await prisma.documents.update({
        where: { id: documentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.name || session.user.email
        }
      });
    });

    // Create audit log entry
    await withRetry(async () => {
      return await prisma.document_audit_logs.create({
        data: {
          id: uuidv4(), // Generate unique ID
          documentId: documentId,
          userId: session.user.id || session.user.email || 'system',
          userEmail: session.user.email || null,
          action: 'DELETED',
          details: 'Document deleted from personal repository',
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting personal document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}