import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

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
    const eventId = formData.get('eventId') as string

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

    // Map classification to enum value
    const classificationMap: { [key: string]: string } = {
      'PUBLIC': 'PUBLIC',
      'CONFIDENTIAL': 'CONFIDENTIAL', 
      'SECRET': 'RESTRICTED',
      'TOP_SECRET': 'TOP_SECRET',
      'INTERNAL': 'INTERNAL'
    }
    
    // Map category to enum value
    const categoryMap: { [key: string]: string } = {
      'Policy': 'POLICY',
      'Policies': 'POLICY',
      'Procedure': 'PROCEDURE',
      'Procedures': 'PROCEDURE',
      'Form': 'FORM',
      'Forms': 'FORM',
      'Report': 'REPORT',
      'Reports': 'REPORT',
      'Activity reports': 'REPORT',
      'Activity Reports': 'REPORT',
      'Financial Reports': 'REPORT',
      'Progress Reports': 'REPORT',
      'Contract': 'CONTRACT',
      'Contracts': 'CONTRACT',
      'Invoice': 'INVOICE',
      'Invoices': 'INVOICE',
      'Presentation': 'PRESENTATION',
      'Presentations': 'PRESENTATION',
      'Spreadsheet': 'SPREADSHEET',
      'Spreadsheets': 'SPREADSHEET',
      'Image': 'IMAGE',
      'Images': 'IMAGE',
      'Video': 'VIDEO',
      'Videos': 'VIDEO',
      'Audio': 'AUDIO',
      'Archive': 'ARCHIVE',
      'Archives': 'ARCHIVE',
      'General': 'OTHER',
      'Other': 'OTHER',
      'Miscellaneous': 'OTHER'
    }

    // Generate unique filename
    const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const filename = `${documentId}_${file.name}`
    const filePath = `/uploads/${filename}`
    
    // TODO: Implement actual file storage (AWS S3, Azure Blob, etc.)
    // For now, we'll just save the metadata
    
    // Get mapped values with error handling
    const mappedCategory = categoryMap[category] || 'OTHER';
    const mappedClassification = classificationMap[classification] || 'PUBLIC';
    
    console.log(`📁 Mapping category "${category}" to "${mappedCategory}"`);
    console.log(`🔒 Mapping classification "${classification}" to "${mappedClassification}"`);
    
    // Save document metadata to database
    const document = await prisma.documents.create({
      data: {
        id: randomUUID(),
        filename: filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        url: null, // Will be set when file is actually uploaded to storage
        category: mappedCategory as any,
        description: title,
        tags: [],
        classification: mappedClassification as any,
        isPublic: classification === 'PUBLIC',
        uploadedBy: session.user?.id,
        customMetadata: eventId ? { eventId } : {},
        updatedAt: new Date()
      }
    })

    // Get uploader info for response
    let uploaderName = 'Unknown'
    if (session.user?.id) {
      const uploader = await prisma.users.findUnique({
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
        classification: document.classification,
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
