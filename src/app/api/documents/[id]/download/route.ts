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
      
      // Return helpful error message with file info
      return NextResponse.json(
        { 
          error: 'File not found on disk',
          details: {
            documentId: document.id,
            filename: document.originalName,
            expectedPath: document.path,
            message: 'The file may have been moved or deleted, or was uploaded before file storage was properly implemented.'
          }
        },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Create proper headers for file download
    const headers = new Headers();
    headers.set('Content-Type', document.mimeType || 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
    headers.set('Cache-Control', 'no-cache');

    // Return the file as a response
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ Document download error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}