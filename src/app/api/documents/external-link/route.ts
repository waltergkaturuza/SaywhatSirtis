import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions for external platform integration
    const hasAccess = session.user.permissions?.includes("documents.external_platforms") ||
                     session.user.permissions?.includes("documents.full_access") ||
                     session.user.roles?.includes('admin');

    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      externalUrl,
      downloadUrl,
      classification = 'PUBLIC',
      source,
      sourceId,
      metadata = {}
    } = body;

    if (!title || !externalUrl || !source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create external document link in database
    const document = await prisma.documents.create({
      data: {
        id: randomUUID(),
        filename: title,
        originalName: title,
        path: externalUrl,
        url: externalUrl,
        mimeType: 'application/external-link',
        size: parseInt(metadata.size?.replace(/[^\d]/g, '') || '0'),
        description: `External file from ${source}`,
        classification: classification,
        category: 'OTHER',
        author: metadata.modifiedBy || session.user.name || 'Unknown',
        department: metadata.department || session.user.department || 'External',
        updatedAt: new Date(),
        customMetadata: {
          ...metadata,
          source: source,
          sourceId: sourceId,
          externalUrl: externalUrl,
          downloadUrl: downloadUrl,
          linkedAt: new Date().toISOString(),
          linkedBy: session.user.id,
          type: 'external_link'
        }
      }
    });

    // Log the external linking activity
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        action: 'EXTERNAL_LINK_CREATED',
        resource: 'DOCUMENT',
        resourceId: document.id,
        details: {
          documentTitle: title,
          source: source,
          externalUrl: externalUrl,
          classification: classification
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.filename,
        classification: document.classification,
        source: source,
        externalUrl: externalUrl
      }
    });

  } catch (error) {
    console.error('External link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create external document link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    // Get external document links (excluding personal repository drafts)
    const whereClause = {
      category: 'OTHER' as const,
      mimeType: 'application/external-link',
      isPersonalRepo: false,  // Only show published external links
      isDeleted: false,       // Only show non-deleted links
      ...(source && { 
        customMetadata: {
          path: ['source'],
          equals: source
        }
      })
    };

    const externalLinks = await prisma.documents.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        description: true,
        classification: true,
        size: true,
        createdAt: true,
        author: true,
        department: true,
        updatedAt: true,
        url: true,
        customMetadata: true
      }
    });

    return NextResponse.json({
      success: true,
      links: externalLinks.map(link => {
        const metadata = link.customMetadata as any;
        return {
          id: link.id,
          title: link.filename,
          fileName: link.originalName,
          description: link.description,
          classification: link.classification,
          size: `${link.size} bytes`,
          uploadDate: link.createdAt.toISOString(),
          uploadedBy: link.author || 'Unknown',
          department: link.department,
          modifiedAt: link.updatedAt.toISOString(),
          url: link.url,
          source: metadata?.source || 'unknown',
          sourceId: metadata?.sourceId,
          externalUrl: metadata?.externalUrl || link.url,
          downloadUrl: metadata?.downloadUrl,
          linkedAt: metadata?.linkedAt,
          linkedBy: metadata?.linkedBy
        };
      })
    });

  } catch (error) {
    console.error('External links fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external document links' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    // Check if user has permission to delete
    const link = await prisma.documents.findUnique({
      where: { id: linkId },
      select: { 
        id: true,
        filename: true,
        author: true,
        customMetadata: true
      }
    });

    if (!link) {
      return NextResponse.json({ error: 'External link not found' }, { status: 404 });
    }

    const canDelete = session.user.roles?.includes('admin') ||
                     session.user.permissions?.includes('documents.full_access') ||
                     (link.customMetadata as any)?.linkedBy === session.user.id;

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Delete the external link
    await prisma.documents.delete({
      where: { id: linkId }
    });

    // Log the deletion
    await prisma.audit_logs.create({
      data: {
        id: randomUUID(),
        userId: session.user.id,
        action: 'EXTERNAL_LINK_DELETED',
        resource: 'DOCUMENT',
        resourceId: linkId,
        details: {
          documentTitle: link.filename,
          source: (link.customMetadata as any)?.source || 'unknown'
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('External link deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete external document link' },
      { status: 500 }
    );
  }
}