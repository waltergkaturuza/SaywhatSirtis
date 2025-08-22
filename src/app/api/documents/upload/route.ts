import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const files = formData.getAll('files') as File[]
    const projectId = formData.get('projectId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: "No files provided" 
      }, { status: 400 })
    }

    const uploadedDocuments = []

    // Process each file
    for (const file of files) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          success: false,
          error: `File ${file.name} is too large. Maximum size is 10MB.` 
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
      // 3. Store metadata in database
      
      // For now, we'll simulate the upload
      const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      
      const documentData = {
        id: documentId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        uploadedBy: session.user?.email || 'unknown',
        projectId: projectId,
        // In real implementation, this would be the cloud storage URL
        url: `/api/documents/${documentId}/download`,
        status: 'uploaded'
      }

      uploadedDocuments.push(documentData)
    }

    // Here you would typically save the document metadata to the database
    // For now, we'll just return the metadata

    return NextResponse.json({ 
      success: true, 
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
      data: uploadedDocuments
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Document upload error:', error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to upload documents",
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
