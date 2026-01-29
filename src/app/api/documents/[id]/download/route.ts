import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { getSignedUrl } from '@/lib/storage/supabase-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user?.id || session?.user?.email || 'anonymous';
    const userEmail = session?.user?.email || null;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      // @ts-expect-error: ip is available in Node runtime
      request.ip ||
      'unknown';

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
        isPublic: true,
        customMetadata: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const respondWithFile = (buffer: Uint8Array) => {
      const headers = new Headers();
      headers.set('Content-Type', document.mimeType || 'application/octet-stream');
      headers.set('Content-Length', buffer.length.toString());
      headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
      headers.set('Cache-Control', 'no-cache');

      // Convert Uint8Array to ArrayBuffer for NextResponse
      // Use slice() to create a new Uint8Array with a proper ArrayBuffer
      const bufferCopy = buffer.slice();
      const arrayBuffer = bufferCopy.buffer.slice(bufferCopy.byteOffset, bufferCopy.byteOffset + bufferCopy.byteLength);
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers
      });
    };

    // Helper: fetch remote file (e.g., legacy uploads stored externally)
    const fetchRemoteFile = async (url: string) => {
      try {
        const remoteResponse = await fetch(url);
        if (!remoteResponse.ok) {
          throw new Error(`Remote fetch failed with status ${remoteResponse.status}`);
        }
        const arrayBuffer = await remoteResponse.arrayBuffer();
        const headers = new Headers();
        headers.set('Content-Type', remoteResponse.headers.get('content-type') ?? document.mimeType ?? 'application/octet-stream');
        headers.set('Content-Length', arrayBuffer.byteLength.toString());
        headers.set('Content-Disposition', `attachment; filename="${document.originalName}"`);
        headers.set('Cache-Control', 'no-cache');

        // arrayBuffer is already an ArrayBuffer, which is a valid BodyInit type
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers
        });
      } catch (remoteError) {
        console.error('Remote document download failed:', remoteError);
        return null;
      }
    };

    // Check storage provider from customMetadata
    const customMetadata = document.customMetadata as any;
    const storageProvider = customMetadata?.storageProvider || 'filesystem';
    const storageBucket = customMetadata?.storageBucket || 'documents';

    // If stored in Supabase Storage, get signed URL
    if (storageProvider === 'supabase' && document.path) {
      try {
        const signedUrlResult = await getSignedUrl(storageBucket, document.path, 3600); // 1 hour expiry
        
        if (signedUrlResult.success && signedUrlResult.url) {
          // Redirect to signed URL
          const redirectResponse = NextResponse.redirect(signedUrlResult.url, 302);
          redirectResponse.headers.set('Cache-Control', 'no-cache');
          return redirectResponse;
        } else {
          console.warn('Failed to generate Supabase signed URL, falling back to direct URL:', signedUrlResult.error);
        }
      } catch (supabaseError) {
        console.error('Supabase Storage error:', supabaseError);
        // Fall through to other methods
      }
    }

    // If document has a direct URL (Supabase public URL or other), use it
    if (document.url) {
      const remoteResponse = await fetchRemoteFile(document.url);
      if (remoteResponse) {
        return remoteResponse;
      }
      // Fallback to redirect so the browser can try to download directly
      try {
        const redirectResponse = NextResponse.redirect(document.url, 302);
        redirectResponse.headers.set('Cache-Control', 'no-cache');
        return redirectResponse;
      } catch (redirectError) {
        console.error('Remote document redirect failed:', redirectError);
      }
    }

    // Fallback to filesystem (for legacy files or local development)
    if (document.path && storageProvider === 'filesystem') {
      const normalizedPath = document.path.startsWith('uploads')
        ? document.path
        : `uploads/${document.path.replace(/^\/+/, '')}`;
      const filePath = path.join(process.cwd(), 'public', normalizedPath);

      try {
        await fs.access(filePath);
        const fileBuffer = await fs.readFile(filePath);
        return respondWithFile(new Uint8Array(fileBuffer));
      } catch (error) {
        console.warn('File not found on disk:', {
          filePath,
          error: String(error)
        });
      }
    }

    return NextResponse.json(
      { 
        error: 'File not found',
        details: {
          documentId: document.id,
          filename: document.originalName,
          expectedPath: document.path,
          message: 'The file may have been moved or deleted. Please re-upload the document.'
        }
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('❌ Document download error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}