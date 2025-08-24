import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Documents API: Starting request...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('Documents API: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Documents API: Fetching documents from database...')
    
    // Check if database is connected
    try {
      await prisma.$connect()
      console.log('Documents API: Database connected successfully')
    } catch (dbError) {
      console.error('Documents API: Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 })
    }

    // Fetch documents from database
    const documents = await prisma.document.findMany({
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform data for frontend
    const transformedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      description: doc.description,
      classification: 'PUBLIC', // doc.classification,
      category: doc.category,
      type: doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE',
      size: doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
      uploadedBy: 'Unknown', // doc.uploader?.name || doc.uploader?.email || 'Unknown',
      uploadDate: doc.createdAt.toISOString(),
      lastModified: doc.updatedAt.toISOString(),
      version: doc.version || '1.0',
      tags: doc.tags ? JSON.parse(doc.tags) : [],
      folder: `/${doc.category.toLowerCase().replace(/_/g, '-')}`,
      downloadCount: 0, // TODO: Implement download tracking
      viewCount: 0, // TODO: Implement view tracking
      favoriteCount: 0, // TODO: Implement favorites
      thumbnail: null,
      aiScore: {
        sentiment: 0.7,
        readability: 0.75,
        quality: 0.8
      },
      permissions: {
        canView: true,
        canDownload: true,
        canEdit: doc.uploadedBy === session.user.id,
        canDelete: doc.uploadedBy === session.user.id,
        canShare: true // doc.classification !== 'TOP_SECRET'
      }
    }))

    return NextResponse.json({
      success: true,
      documents: transformedDocuments,
      total: transformedDocuments.length
    })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, fileName, filePath, fileSize, mimeType, category, classification, description } = await request.json()
    
    if (!title || !fileName || !filePath || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newDocument = await prisma.document.create({
      data: {
        title,
        fileName,
        filePath,
        fileSize,
        mimeType,
        category,
        // classification: classification || 'PUBLIC',
        description,
        uploadedBy: session.user.id
      },
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      document: newDocument
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, description, category, classification } = await request.json()
    
    // Check if document exists and user has permission
    const existingDocument = await prisma.document.findUnique({
      where: { id }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (existingDocument.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title: title || existingDocument.title,
        description: description || existingDocument.description,
        category: category || existingDocument.category,
        // classification: classification || existingDocument.classification,
        updatedAt: new Date()
      },
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      document: updatedDocument
    })
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Check if document exists and user has permission
    const existingDocument = await prisma.document.findUnique({
      where: { id }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (existingDocument.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const deletedDocument = await prisma.document.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Document deleted successfully',
      document: deletedDocument
    })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
