import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get document from database
    const document = await prisma.documents.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        path: true,
        classification: true,
        isPublic: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if file exists on disk
    const filePath = path.join(process.cwd(), 'public', document.path);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('File not found on disk:', filePath, error);
      
      // Return detailed error information for better debugging
      return NextResponse.json({
        error: 'File not found on disk',
        details: {
          documentId: document.id,
          filename: document.filename,
          originalName: document.originalName,
          expectedPath: filePath,
          databasePath: document.path,
          suggestion: 'The file may have been moved, deleted, or the path in the database is incorrect.'
        }
      }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Create proper headers for inline viewing
    const headers = new Headers();
    headers.set('Content-Type', document.mimeType || 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Content-Disposition', `inline; filename="${document.originalName}"`);
    headers.set('Cache-Control', 'public, max-age=31536000');
    
    // Add CORS headers for cross-origin requests
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');

    // Return the file as a response for viewing
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ Document view error:', error);
    return NextResponse.json(
      { error: 'Failed to view document' },
      { status: 500 }
    );
  }
}