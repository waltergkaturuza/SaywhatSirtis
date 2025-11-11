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

    const { documentId, isFavorite } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const userId = session.user.id || session.user.email || 'unknown';

    if (isFavorite) {
      // Add to favorites
      await prisma.document_favorites.upsert({
        where: {
          documentId_userId: {
            documentId,
            userId
          }
        },
        update: {},
        create: {
          id: randomUUID(),
          documentId,
          userId,
          addedAt: new Date()
        }
      });

      // Create audit log
      await prisma.document_audit_logs.create({
        data: {
          id: randomUUID(),
          documentId,
          userId,
          userEmail: session.user.email || null,
          action: 'FAVORITED',
          details: { source: 'favorites_toggle' },
          timestamp: new Date()
        }
      }).catch((err) => console.error('Failed to log favorite action:', err));

      return NextResponse.json({ 
        success: true, 
        message: 'Added to favorites',
        isFavorite: true
      });
    } else {
      // Remove from favorites
      await prisma.document_favorites.deleteMany({
        where: {
          documentId,
          userId
        }
      });

      // Create audit log
      await prisma.document_audit_logs.create({
        data: {
          id: randomUUID(),
          documentId,
          userId,
          userEmail: session.user.email || null,
          action: 'UNFAVORITED',
          details: { source: 'favorites_toggle' },
          timestamp: new Date()
        }
      }).catch((err) => console.error('Failed to log unfavorite action:', err));

      return NextResponse.json({ 
        success: true, 
        message: 'Removed from favorites',
        isFavorite: false
      });
    }

  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email || 'unknown';

    const favorites = await prisma.document_favorites.findMany({
      where: {
        userId,
        documents: {
          isDeleted: false
        }
      },
      include: {
        documents: {
          select: {
            id: true,
            originalName: true,
            filename: true,
            mimeType: true,
            size: true,
            uploadedBy: true,
            createdAt: true,
            updatedAt: true,
            department: true,
            category: true,
            classification: true,
            folderPath: true
          }
        }
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      favorites: favorites.map(fav => ({
        ...fav.documents,
        isFavorite: true,
        favoritedAt: fav.addedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

