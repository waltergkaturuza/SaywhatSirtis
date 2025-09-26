import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { path, department, category, documentId } = await request.json();

    if (!path || !department || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: path, department, category' }, 
        { status: 400 }
      );
    }

    // Check if folder structure already exists
    let folderRecord = await prisma.document_category_folders.findFirst({
      where: {
        path: path,
        department: department,
        category: category
      }
    });

    // Create folder structure if it doesn't exist
    if (!folderRecord) {
      folderRecord = await prisma.document_category_folders.create({
        data: {
          path: path,
          department: department,
          category: category,
          createdBy: session.user.id || session.user.email || 'system',
          createdAt: new Date(),
          isActive: true,
          documentCount: 0
        }
      });
    }

    // Update document count
    await prisma.document_category_folders.update({
      where: { id: folderRecord.id },
      data: {
        documentCount: {
          increment: 1
        },
        lastUpdated: new Date()
      }
    });

    // If documentId provided, link document to folder
    if (documentId) {
      try {
        // Update document with folder path (assuming documents table has folderPath field)
        await prisma.documents.update({
          where: { id: documentId },
          data: {
            folderPath: path,
            department: department,
            category: category
          }
        });
      } catch (docError) {
        console.warn('Could not update document with folder path:', docError);
        // Continue even if document update fails - folder is still created
      }
    }

    return NextResponse.json({
      success: true,
      folderPath: path,
      folderId: folderRecord.id,
      message: 'Folder structure ensured successfully'
    });

  } catch (error) {
    console.error('Error ensuring folder structure:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve folder structure
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const folders = await prisma.document_category_folders.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { department: 'asc' },
        { category: 'asc' }
      ],
      select: {
        id: true,
        path: true,
        department: true,
        category: true,
        documentCount: true,
        createdAt: true,
        lastUpdated: true
      }
    });

    // Group folders by department
    const folderStructure = folders.reduce((acc: Record<string, {
      department: string;
      categories: Array<{
        category: string;
        path: string;
        documentCount: number;
        id: string;
      }>;
      totalDocuments: number;
    }>, folder) => {
      if (!acc[folder.department]) {
        acc[folder.department] = {
          department: folder.department,
          categories: [],
          totalDocuments: 0
        };
      }
      
      acc[folder.department].categories.push({
        category: folder.category,
        path: folder.path,
        documentCount: folder.documentCount,
        id: folder.id
      });
      
      acc[folder.department].totalDocuments += folder.documentCount;
      
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      folders: Object.values(folderStructure)
    });

  } catch (error) {
    console.error('Error retrieving folder structure:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}