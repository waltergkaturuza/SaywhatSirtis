import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;
    const versionComment = formData.get('versionComment') as string;

    if (!file || !documentId) {
      return NextResponse.json({ error: 'File and document ID required' }, { status: 400 });
    }

    // Get the current latest version
    const currentDocument = await prisma.documents.findUnique({
      where: { id: documentId }
    });

    if (!currentDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Calculate new version number
    const currentVersionNum = parseFloat(currentDocument.version);
    const newVersionNum = (currentVersionNum + 1).toFixed(1);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 11);
    const newFilename = `${timestamp}${randomString}_${file.name}`;
    
    // Use same folder structure as parent
    const folderPath = path.dirname(currentDocument.path);
    const newFilePath = `${folderPath}/${newFilename}`;
    const fullPath = path.join(process.cwd(), 'public', newFilePath);

    // Save file to disk
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(fullPath, buffer);
    } catch (fileError) {
      console.error('File save error:', fileError);
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }

    // Mark current version as not latest
    await prisma.documents.update({
      where: { id: documentId },
      data: { isLatestVersion: false }
    });

    // Create new version
    const newVersion = await prisma.documents.create({
      data: {
        id: randomUUID(),
        filename: newFilename,
        originalName: file.name,
        path: newFilePath,
        url: null,
        mimeType: file.type,
        size: file.size,
        category: currentDocument.category,
        description: currentDocument.description,
        classification: currentDocument.classification,
        accessLevel: currentDocument.accessLevel,
        isPublic: currentDocument.isPublic,
        department: currentDocument.department,
        departmentId: currentDocument.departmentId,
        folderPath: currentDocument.folderPath,
        tags: currentDocument.tags,
        version: newVersionNum,
        versionComment: versionComment || `Version ${newVersionNum}`,
        isLatestVersion: true,
        parentDocumentId: currentDocument.parentDocumentId || documentId,
        uploadedBy: session.user.id || session.user.email,
        isPersonalRepo: false,
        approvalStatus: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create audit log
    await prisma.document_audit_logs.create({
      data: {
        id: randomUUID(),
        documentId: newVersion.id,
        userId: session.user.id || session.user.email || 'unknown',
        userEmail: session.user.email || null,
        action: 'EDITED',
        details: {
          action: 'new_version_uploaded',
          previousVersion: currentDocument.version,
          newVersion: newVersionNum,
          comment: versionComment
        },
        timestamp: new Date()
      }
    }).catch(err => console.error('Failed to create audit log:', err));

    return NextResponse.json({
      success: true,
      message: 'New version uploaded successfully',
      version: {
        id: newVersion.id,
        version: newVersionNum,
        filename: newVersion.originalName
      }
    });

  } catch (error) {
    console.error('Error uploading new version:', error);
    return NextResponse.json(
      { error: 'Failed to upload new version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

