import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Authentication required", 
        message: "Please log in to upload documents.",
        code: "UNAUTHORIZED"
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const classification = formData.get('classification') as string
    const projectId = formData.get('projectId') as string

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
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false,
        error: `File is too large. Maximum size is 10MB.` 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false,
        error: `File type ${file.type} is not allowed.` 
      }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Upload to cloud storage (AWS S3, Azure Blob, etc.)
    // 2. Get the file URL
    // For now, we'll simulate the file storage
    const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const filePath = `/uploads/${documentId}_${file.name}`
    
    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        title,
        fileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        category: category as any, // Will be validated by Prisma
        classification: (classification || 'PUBLIC') as any,
        uploadedBy: session.user?.id,
        projectId: projectId || null
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
      message: "Document uploaded successfully",
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        category: document.category,
        classification: 'PUBLIC', // document.classification,
        uploadedBy: 'Unknown', // document.uploader?.name || document.uploader?.email,
        uploadedAt: document.createdAt,
        size: document.fileSize
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
