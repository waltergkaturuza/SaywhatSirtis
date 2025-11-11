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

    const { versionId, documentId } = await request.json();

    if (!versionId || !documentId) {
      return NextResponse.json({ error: 'Version ID and Document ID required' }, { status: 400 });
    }

    // Get the version to restore
    const versionToRestore = await prisma.documents.findUnique({
      where: { id: versionId }
    });

    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Get the current latest version
    const currentLatest = await prisma.documents.findFirst({
      where: {
        OR: [
          { id: documentId },
          { parentDocumentId: documentId }
        ],
        isLatestVersion: true,
        isDeleted: false
      }
    });

    if (!currentLatest) {
      return NextResponse.json({ error: 'Current document not found' }, { status: 404 });
    }

    // Calculate new version number
    const currentVersionNum = parseFloat(currentLatest.version);
    const newVersionNum = (Math.floor(currentVersionNum) + 1).toFixed(1);

    // Copy the old version's file to a new location
    let newFilePath = '';
    let newFilename = '';

    if (versionToRestore.path) {
      try {
        const oldPath = path.join(process.cwd(), 'public', versionToRestore.path);
        const fileExists = await fs.access(oldPath).then(() => true).catch(() => false);

        if (fileExists) {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 11);
          newFilename = `${timestamp}${randomString}_${versionToRestore.originalName}`;
          
          // Extract folder from original path
          const folderPath = path.dirname(versionToRestore.path);
          newFilePath = `${folderPath}/${newFilename}`;
          
          const newFullPath = path.join(process.cwd(), 'public', newFilePath);
          
          // Copy file
          await fs.copyFile(oldPath, newFullPath);
        }
      } catch (copyError) {
        console.error('Error copying file for version restore:', copyError);
        // Continue anyway - we'll create the metadata record
      }
    }

    // Mark current latest as not latest
    await prisma.documents.update({
      where: { id: currentLatest.id },
      data: { isLatestVersion: false }
    });

    // Create new version based on the restored one
    const restoredDocument = await prisma.documents.create({
      data: {
        id: randomUUID(),
        filename: newFilename || versionToRestore.filename,
        originalName: versionToRestore.originalName,
        path: newFilePath || versionToRestore.path,
        url: versionToRestore.url,
        mimeType: versionToRestore.mimeType,
        size: versionToRestore.size,
        category: versionToRestore.category,
        description: versionToRestore.description,
        classification: versionToRestore.classification,
        accessLevel: versionToRestore.accessLevel,
        isPublic: versionToRestore.isPublic,
        department: versionToRestore.department,
        departmentId: versionToRestore.departmentId,
        folderPath: versionToRestore.folderPath,
        tags: versionToRestore.tags,
        version: newVersionNum,
        versionComment: `Restored from version ${versionToRestore.version}`,
        isLatestVersion: true,
        parentDocumentId: versionToRestore.parentDocumentId || documentId,
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
        documentId: restoredDocument.id,
        userId: session.user.id || session.user.email || 'unknown',
        userEmail: session.user.email || null,
        action: 'EDITED',
        details: {
          action: 'version_restored',
          restoredFromVersion: versionToRestore.version,
          newVersion: newVersionNum,
          restoredBy: session.user.name || session.user.email
        },
        timestamp: new Date()
      }
    }).catch(err => console.error('Failed to create audit log:', err));

    return NextResponse.json({
      success: true,
      message: 'Version restored successfully',
      newVersion: {
        id: restoredDocument.id,
        version: newVersionNum
      }
    });

  } catch (error) {
    console.error('Error restoring version:', error);
    return NextResponse.json(
      { error: 'Failed to restore version', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

