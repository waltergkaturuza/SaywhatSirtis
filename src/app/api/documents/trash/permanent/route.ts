import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const isAdmin = session.user.roles?.includes('admin') ||
                    session.user.roles?.includes('ADMIN') ||
                    session.user.roles?.includes('ADMINISTRATOR') ||
                    session.user.permissions?.includes('documents.admin') ||
                    session.user.permissions?.includes('documents.full_access');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Get document before deletion
    const document = await prisma.documents.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Create final audit log before deletion
    await prisma.document_audit_logs.create({
      data: {
        id: randomUUID(),
        documentId,
        userId: session.user.id || session.user.email || 'unknown',
        userEmail: session.user.email || null,
        action: 'DELETED',
        details: {
          permanentDeletion: true,
          deletedBy: session.user.name || session.user.email,
          originalFilename: document.originalName,
          fileSize: document.size,
          deletedAt: new Date().toISOString()
        },
        timestamp: new Date()
      }
    }).catch(err => console.error('Failed to create audit log:', err));

    // Delete file from disk if it exists
    if (document.path) {
      try {
        const filePath = path.join(process.cwd(), 'public', document.path);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('File not found on disk or already deleted:', fileError);
        // Continue with database deletion even if file doesn't exist
      }
    }

    // Permanently delete from database
    await prisma.documents.delete({
      where: { id: documentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Document permanently deleted'
    });

  } catch (error) {
    console.error('Error permanently deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete document' },
      { status: 500 }
    );
  }
}

