import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

const sanitizeFolderSegment = (value: string | null | undefined) => {
  if (!value) return ''
  return value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[\\/]+/g, '-')
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    // Check permissions - Allow all authenticated users to upload documents
    const hasPermission = session.user?.permissions?.includes('documents.create') ||
                         session.user?.permissions?.includes('documents.full_access') ||
                         session.user?.permissions?.includes('documents') ||
                         session.user?.permissions?.includes('documents_edit') ||
                         session.user?.permissions?.includes('documents_view') ||
                         session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1', 'advance_user_2', 'basic_user_1', 'basic_user_2', 'hr'].includes(role.toLowerCase())) ||
                         session.user; // Allow all authenticated users

    if (!hasPermission) {
      return NextResponse.json({ 
        success: false, 
        error: "Insufficient permissions" 
      }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const categoryLabel = formData.get('category') as string
    const classification = formData.get('classification') as string
    const accessLevel = formData.get('accessLevel') as string
    const eventId = formData.get('eventId') as string
    const customFolderPath = formData.get('folderPath') as string
    
    // Personal repository fields
    const uploadedBy = formData.get('uploadedBy') as string
    const department = formData.get('department') as string
    const status = formData.get('status') as string
    const isPersonalRepo = formData.get('isPersonalRepo') === 'true'
    const categoryDisplayOverride = formData.get('categoryDisplay') as string | null
    const categoryEnumOverride = formData.get('categoryEnum') as string | null

    // Additional metadata
    const customMetadata = formData.get('customMetadata') ? 
      JSON.parse(formData.get('customMetadata') as string) : {}

    // Access level specific selections
    const selectedIndividuals = formData.get('selectedIndividuals') ? 
      JSON.parse(formData.get('selectedIndividuals') as string) : []
    const selectedDepartments = formData.get('selectedDepartments') ? 
      JSON.parse(formData.get('selectedDepartments') as string) : []
    const selectedTeams = formData.get('selectedTeams') ? 
      JSON.parse(formData.get('selectedTeams') as string) : []

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: "No file provided" 
      }, { status: 400 })
    }

    if (!title || !categoryLabel) {
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
    
    // Create folder structure: use custom folderPath if provided, otherwise use default
    let folderPath: string
    const categoryEnumFromMap = categoryMap[categoryLabel] || 'OTHER'
    const finalCategoryEnum = categoryEnumOverride || categoryEnumFromMap
    const finalCategoryDisplay = categoryDisplayOverride || categoryLabel || 'General Document'

    if (customFolderPath) {
      folderPath = `uploads/${sanitizeFolderSegment(customFolderPath)}`
    } else {
      // Default folder structure: uploads/department/category/
      const departmentFolder = department || 'General'
      folderPath = `uploads/${sanitizeFolderSegment(departmentFolder)}/${sanitizeFolderSegment(finalCategoryDisplay)}`
    }
    
    const filePath = `${folderPath}/${filename}`
    
    // Initialize metadata variables
    let extractedMetadata: any = {};
    let extractedKeywords: string[] = [];
    
    // Save file to disk
    try {
      // Create dynamic folder structure
      const fullFolderPath = path.join(process.cwd(), 'public', folderPath)
      await fs.mkdir(fullFolderPath, { recursive: true })
      console.log(`📁 Created folder structure: ${fullFolderPath}`)
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fullPath = path.join(process.cwd(), 'public', filePath)
      
      await fs.writeFile(fullPath, buffer)
      console.log(`✅ File saved to: ${fullPath}`)
      
      // Extract document metadata using document processor
      try {
        console.log(`📄 Processing document for metadata extraction...`);
        
        // Dynamically import document processor to avoid build-time issues
        const { documentProcessor } = await import('@/lib/document-processor');
        
        const processingResult = await documentProcessor.processDocument(fullPath, file.type);
        
        if (processingResult.success && processingResult.metadata) {
          extractedMetadata = {
            title: processingResult.metadata.title,
            author: processingResult.metadata.author,
            subject: processingResult.metadata.subject,
            creator: processingResult.metadata.creator,
            producer: processingResult.metadata.producer,
            pageCount: processingResult.metadata.pageCount,
            wordCount: processingResult.metadata.wordCount,
            language: processingResult.metadata.language,
            dimensions: processingResult.metadata.dimensions,
            creationDate: processingResult.metadata.creationDate,
            modificationDate: processingResult.metadata.modificationDate,
            documentProcessed: true // Mark as processed
          };
          
          // Extract keywords from text content
          if (processingResult.textContent) {
            extractedKeywords = documentProcessor.extractKeywords(processingResult.textContent, 15);
            extractedMetadata.extractedKeywords = extractedKeywords;
          }
          
          console.log(`✅ Metadata extracted successfully:`, {
            title: extractedMetadata.title,
            author: extractedMetadata.author,
            pageCount: extractedMetadata.pageCount,
            wordCount: extractedMetadata.wordCount,
            keywordsCount: extractedKeywords.length
          });
        }
      } catch (metadataError) {
        console.warn(`⚠️  Metadata extraction failed (continuing with upload):`, metadataError);
        // Continue with upload even if metadata extraction fails
      }
      
    } catch (fileError) {
      console.error('❌ File save error:', fileError)
      return NextResponse.json({ 
        success: false, 
        error: "Failed to save file to disk" 
      }, { status: 500 })
    }
    
    // Get mapped values with error handling
    const mappedCategory = finalCategoryEnum;
    const mappedClassification = classificationMap[classification] || 'PUBLIC';
    
    console.log(`📁 Mapping category "${categoryLabel}" to "${mappedCategory}"`);
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
        description: extractedMetadata.title || extractedMetadata.subject || title,
        tags: extractedKeywords.length > 0 ? extractedKeywords : [],
        classification: mappedClassification as any,
        accessLevel: accessLevel || 'organization',
        isPublic: classification === 'PUBLIC',
        uploadedBy: extractedMetadata.author || uploadedBy || session.user?.name || session.user?.email || 'Unknown User',
        department: department || 'Unknown Department',
        folderPath: sanitizeFolderSegment(customFolderPath) || `${sanitizeFolderSegment(department || 'Unknown Department')}/${sanitizeFolderSegment(finalCategoryDisplay)}`,
        isPersonalRepo: isPersonalRepo,
        approvalStatus: status === 'APPROVED' ? 'APPROVED' : (isPersonalRepo ? 'DRAFT' : 'PENDING_REVIEW'),
        reviewStatus: status === 'APPROVED' ? 'APPROVED' : 'PENDING',
        customMetadata: {
          ...(eventId ? { eventId } : {}),
          ...(selectedIndividuals.length > 0 ? { selectedIndividuals } : {}),
          ...(selectedDepartments.length > 0 ? { selectedDepartments } : {}),
          ...(selectedTeams.length > 0 ? { selectedTeams } : {}),
          accessLevel: accessLevel || 'organization',
          // Add extracted metadata
          ...extractedMetadata,
          extractedKeywords,
          documentProcessed: true,
          // Add custom metadata from form
          ...customMetadata
        },
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
