import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('documents.create') ||
                         session.user?.permissions?.includes('documents.full_access') ||
                         session.user?.roles?.includes('admin')

    if (!hasPermission) {
      return NextResponse.json({ 
        success: false, 
        error: "Insufficient permissions" 
      }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const classification = formData.get('classification') as string

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: "No file provided" 
      }, { status: 400 })
    }

    if (!title || !category) {
      return NextResponse.json({ 
        success: false, 
        error: "Title and category are required" 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: "File size exceeds 10MB limit" 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: "File type not allowed" 
      }, { status: 400 })
    }

    // Generate unique filename
    const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const filename = `${documentId}_${file.name}`
    const filePath = `/uploads/${filename}`
    
    // TODO: Implement actual file storage (AWS S3, Azure Blob, etc.)
    // For now, we'll just save the metadata
    
    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        filename: filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        url: null, // Will be set when file is actually uploaded to storage
        category: category as any,
        description: title,
        tags: [],
        isPublic: classification === 'PUBLIC',
        accessLevel: classification?.toLowerCase() || 'internal',
        uploadedBy: session.user?.id
      }
    })

    // Get uploader info for response
    let uploaderName = 'Unknown'
    if (session.user?.id) {
      const uploader = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          firstName: true,
          lastName: true
        }
      })
      if (uploader) {
        uploaderName = `${uploader.firstName} ${uploader.lastName}`
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        title: document.description,
        fileName: document.originalName,
        category: document.category,
        classification: document.accessLevel?.toUpperCase(),
        uploadedBy: uploaderName,
        uploadedAt: document.createdAt,
        size: `${(document.size / 1024 / 1024).toFixed(1)} MB`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Document upload error:', error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to upload document",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 })
  }
}
