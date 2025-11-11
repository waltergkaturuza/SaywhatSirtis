import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Check if document exists and is deleted
    const document = await prisma.documents.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!document.isDeleted) {
      return NextResponse.json({ error: 'Document is not in trash' }, { status: 400 });
    }

    // Restore the document
    const restoredDocument = await prisma.documents.update({
      where: { id: documentId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prisma.document_audit_logs.create({
      data: {
        id: randomUUID(),
        documentId,
        userId: session.user.id || session.user.email || 'unknown',
        userEmail: session.user.email || null,
        action: 'RESTORED',
        details: {
          restoredBy: session.user.name || session.user.email,
          restoredAt: new Date().toISOString()
        },
        timestamp: new Date()
      }
    }).catch(err => console.error('Failed to create audit log:', err));

    return NextResponse.json({
      success: true,
      message: 'Document restored successfully',
      document: {
        id: restoredDocument.id,
        filename: restoredDocument.originalName
      }
    });

  } catch (error) {
    console.error('Error restoring document:', error);
    return NextResponse.json(
      { error: 'Failed to restore document' },
      { status: 500 }
    );
  }
}

