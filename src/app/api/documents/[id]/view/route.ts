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
        url: true,
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

    const respondWithBuffer = (buffer: Uint8Array, contentType?: string) => {
      const headers = new Headers();
      headers.set('Content-Type', contentType || document.mimeType || 'application/octet-stream');
      headers.set('Content-Length', buffer.length.toString());
      headers.set('Content-Disposition', `inline; filename="${document.originalName}"`);
      headers.set('Cache-Control', 'public, max-age=31536000');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET');

      return new NextResponse(buffer, {
        status: 200,
        headers
      });
    };

    const fetchRemoteFile = async (url: string) => {
      try {
        const remoteResponse = await fetch(url);
        if (!remoteResponse.ok) {
          throw new Error(`Remote view fetch failed with status ${remoteResponse.status}`);
        }
        const arrayBuffer = await remoteResponse.arrayBuffer();
        const contentType = remoteResponse.headers.get('content-type') ?? document.mimeType ?? 'application/octet-stream';
        return respondWithBuffer(new Uint8Array(arrayBuffer), contentType);
      } catch (remoteError) {
        console.error('Remote document view fetch failed:', remoteError);
        return null;
      }
    };

    if (document.path) {
      const normalizedPath = document.path.startsWith('uploads')
        ? document.path
        : `uploads/${document.path.replace(/^\/+/, '')}`;
      const filePath = path.join(process.cwd(), 'public', normalizedPath);

      try {
        await fs.access(filePath);
        const fileBuffer = await fs.readFile(filePath);
        return respondWithBuffer(new Uint8Array(fileBuffer));
      } catch (error) {
        console.warn('File not found on disk for view, attempting remote fallback if available:', {
          filePath,
          error: String(error)
        });
      }
    }

    if (document.url) {
      const remoteResponse = await fetchRemoteFile(document.url);
      if (remoteResponse) {
        return remoteResponse;
      }
      try {
        const redirectResponse = NextResponse.redirect(document.url, 302);
        redirectResponse.headers.set('Cache-Control', 'no-cache');
        return redirectResponse;
      } catch (redirectError) {
        console.error('Remote document redirect failed (view):', redirectError);
      }
    }

    return NextResponse.json({
      error: 'File not found',
      details: {
        documentId: document.id,
        filename: document.filename,
        originalName: document.originalName,
        expectedPath: document.path || null,
        suggestion: 'The file may have been moved or deleted. Please re-upload or contact an administrator.'
      }
    }, { status: 404 });

  } catch (error) {
    console.error('❌ Document view error:', error);
    return NextResponse.json(
      { error: 'Failed to view document' },
      { status: 500 }
    );
  }
}