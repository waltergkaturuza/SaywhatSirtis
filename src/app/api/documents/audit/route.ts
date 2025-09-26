import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user?.roles?.includes('admin') || 
                   session.user?.permissions?.includes('documents.admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all documents
    const documents = await prisma.documents.findMany({
      select: {
        id: true,
        filename: true,
        originalName: true,
        path: true,
        size: true,
        mimeType: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const results = [];
    
    for (const doc of documents) {
      const fullPath = path.join(process.cwd(), 'public', doc.path);
      let fileExists = false;
      
      try {
        await fs.access(fullPath);
        fileExists = true;
      } catch (error) {
        // File doesn't exist
      }
      
      results.push({
        id: doc.id,
        originalName: doc.originalName,
        filename: doc.filename,
        path: doc.path,
        size: doc.size,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
        fileExists,
        fullPath
      });
    }

    const missingFiles = results.filter(doc => !doc.fileExists);
    const existingFiles = results.filter(doc => doc.fileExists);

    return NextResponse.json({
      summary: {
        total: results.length,
        existing: existingFiles.length,
        missing: missingFiles.length
      },
      documents: results,
      missingFiles: missingFiles.map(doc => ({
        id: doc.id,
        name: doc.originalName,
        path: doc.path,
        size: doc.size
      }))
    });

  } catch (error) {
    console.error('❌ Document audit error:', error);
    return NextResponse.json(
      { error: 'Failed to audit documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user?.roles?.includes('admin') || 
                   session.user?.permissions?.includes('documents.admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, documentIds } = await request.json();

    if (action === 'cleanup_missing') {
      // Remove documents that don't have files on disk
      const deletedCount = await prisma.documents.deleteMany({
        where: {
          id: {
            in: documentIds
          }
        }
      });

      return NextResponse.json({
        message: `Cleaned up ${deletedCount.count} documents with missing files`,
        deletedCount: deletedCount.count
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Document cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup documents' },
      { status: 500 }
    );
  }
}