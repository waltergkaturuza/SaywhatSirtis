import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { sanitizeFolderPath, sanitizeFolderSegment, resolveCategoryInfo, buildFolderPath } from '@/lib/documents/category-utils'
import { uploadToSupabaseStorage, ensureBucketExists } from '@/lib/storage/supabase-storage'

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
    const categoryLabelRaw = formData.get('category') as string
    const classification = formData.get('classification') as string
    const accessLevel = formData.get('accessLevel') as string
    const eventId = formData.get('eventId') as string
    const customFolderPath = formData.get('folderPath') as string
    const subunit = formData.get('subunit') as string | null
    
    // Project/Program fields for year/project/date/version structure
    const projectId = formData.get('projectId') as string | null
    const projectName = formData.get('projectName') as string | null
    const projectCode = formData.get('projectCode') as string | null
    const documentYear = formData.get('year') as string | null
    const documentDate = formData.get('date') as string | null
    const documentVersion = formData.get('version') as string | null
    
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

    if (!title || !categoryLabelRaw) {
      return NextResponse.json({ 
        success: false, 
        error: "Title and category are required" 
      }, { status: 400 })
    }

    // Validate file size (100MB limit for videos/large files, 10MB for others)
    const isVideoOrLargeFile = file.type.startsWith('video/') || 
                                file.type.includes('octet-stream') ||
                                file.size > 50 * 1024 * 1024 // Already > 50MB
    const maxSize = isVideoOrLargeFile ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB for videos, 10MB for others
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `File size exceeds ${isVideoOrLargeFile ? '100MB' : '10MB'} limit` 
      }, { status: 400 })
    }

    // Validate file type - Support all common document, image, video, and audio types
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-ms-wmv',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ]

    // Allow any file type if it's a common extension (for flexibility)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const commonExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv',
                              'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff',
                              'mp4', 'mpeg', 'mov', 'avi', 'webm', 'wmv',
                              'mp3', 'wav', 'ogg',
                              'zip', 'rar', '7z']

    if (!allowedTypes.includes(file.type) && (!fileExtension || !commonExtensions.includes(fileExtension))) {
      return NextResponse.json({ 
        success: false, 
        error: `File type "${file.type}" not allowed. Supported: documents, images, videos, audio, and archives.` 
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
    const baseCategoryInfo = resolveCategoryInfo(categoryLabelRaw)
    const categoryLabel = categoryLabelRaw || baseCategoryInfo.label
    const finalCategoryEnum = categoryEnumOverride || baseCategoryInfo.enumValue
    const finalCategoryDisplay = categoryDisplayOverride || baseCategoryInfo.display
    const departmentFolder = department || 'General'

    let folderPath: string
    let documentFolderPath: string

    // If projectId/projectName/projectCode is provided, use year/project/date/version structure
    if (projectId || projectName || projectCode) {
      // Fetch project details if projectId is provided
      let projectNameFromDb: string | null = null
      let projectStartDate: Date | null = null
      if (projectId) {
        try {
          const fetched = await prisma.projects.findUnique({
            where: { id: projectId },
            select: { name: true, startDate: true }
          })
          if (fetched) {
            projectNameFromDb = fetched.name
            projectStartDate = fetched.startDate
          }
        } catch (error) {
          console.warn('Could not fetch project details:', error)
        }
      }

      // Determine year from document date, project start date, or current year
      let year: number | null = null
      if (documentYear) {
        year = parseInt(documentYear)
      } else if (documentDate) {
        year = new Date(documentDate).getFullYear()
      } else if (projectStartDate) {
        year = new Date(projectStartDate).getFullYear()
      }

      documentFolderPath = buildFolderPath({
        projectId: projectId || null,
        projectName: projectName || projectNameFromDb || null,
        projectCode: projectCode || null,
        year: year || null,
        date: documentDate || null,
        version: documentVersion || null,
      })
      folderPath = `uploads/${documentFolderPath}`
    } else if (customFolderPath) {
      // Use custom folder path if provided
      const sanitizedCustom = sanitizeFolderPath(customFolderPath)
      if (sanitizedCustom) {
        documentFolderPath = sanitizedCustom
        folderPath = `uploads/${sanitizedCustom}`
      } else {
        documentFolderPath = buildFolderPath({
          department: departmentFolder,
          subunit,
          categoryDisplay: finalCategoryDisplay,
        })
        folderPath = `uploads/${documentFolderPath}`
      }
    } else {
      // Default structure: department/subunit/category
      documentFolderPath = buildFolderPath({
        department: departmentFolder,
        subunit,
        categoryDisplay: finalCategoryDisplay,
      })
      folderPath = `uploads/${documentFolderPath}`
    }
    
    // Initialize metadata variables
    let extractedMetadata: any = {};
    let extractedKeywords: string[] = [];
    let storageUrl: string | null = null;
    let storageProvider: 'supabase' | 'filesystem' = 'supabase';
    let storagePath: string = '';
    
    // Determine storage strategy: Use Supabase Storage if configured, otherwise fallback to filesystem
    let useSupabaseStorage = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    if (useSupabaseStorage) {
      // Upload to Supabase Storage
      try {
        const bucket = 'documents'; // Default bucket name
        const storageFilePath = `${documentFolderPath}/${filename}`;
        
        // Ensure bucket exists (will warn if it doesn't)
        await ensureBucketExists(bucket);
        
        // Upload file to Supabase Storage
        const uploadResult = await uploadToSupabaseStorage({
          bucket,
          path: storageFilePath,
          file,
          contentType: file.type,
          upsert: false
        });
        
        if (!uploadResult.success) {
          console.error('❌ Supabase Storage upload failed:', uploadResult.error);
          // Fallback to filesystem if Supabase upload fails
          throw new Error(`Supabase upload failed: ${uploadResult.error}`);
        }
        
        storageUrl = uploadResult.url || uploadResult.publicUrl || null;
        storagePath = storageFilePath;
        storageProvider = 'supabase';
        
        console.log(`✅ File uploaded to Supabase Storage: ${storagePath}`);
        console.log(`📎 Storage URL: ${storageUrl}`);
        
        // Extract document metadata from file buffer (if needed)
        // Note: For Supabase Storage, we can process the file after upload if needed
        try {
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const tempPath = path.join(process.cwd(), 'tmp', filename);
          await fs.mkdir(path.dirname(tempPath), { recursive: true });
          await fs.writeFile(tempPath, fileBuffer);
          
          const { documentProcessor } = await import('@/lib/document-processor');
          const processingResult = await documentProcessor.processDocument(tempPath, file.type);
          
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
              documentProcessed: true
            };
            
            if (processingResult.textContent) {
              extractedKeywords = documentProcessor.extractKeywords(processingResult.textContent, 15);
              extractedMetadata.extractedKeywords = extractedKeywords;
            }
          }
          
          // Clean up temp file
          await fs.unlink(tempPath).catch(() => {});
        } catch (metadataError) {
          console.warn(`⚠️  Metadata extraction failed (continuing with upload):`, metadataError);
        }
        
      } catch (supabaseError) {
        console.error('❌ Supabase Storage error, falling back to filesystem:', supabaseError);
        // Fall through to filesystem fallback
        useSupabaseStorage = false;
      }
    }
    
    // Fallback to filesystem storage (for local development or if Supabase is not configured)
    if (!useSupabaseStorage || !storageUrl) {
      const filePath = `${folderPath}/${filename}`;
      storagePath = filePath;
      storageProvider = 'filesystem';
      
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
        console.log(`✅ File saved to filesystem: ${fullPath}`)
        
        // Extract document metadata using document processor
        try {
          console.log(`📄 Processing document for metadata extraction...`);
          
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
              documentProcessed: true
            };
            
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
        }
        
      } catch (fileError) {
        console.error('❌ File save error:', fileError)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to save file to storage" 
        }, { status: 500 })
      }
    }
    
    // Get mapped values with error handling
    const mappedCategory = finalCategoryEnum;
    const mappedClassification = classificationMap[classification] || 'PUBLIC';
    
    console.log(`📁 Mapping category "${categoryLabelRaw}" to "${mappedCategory}"`);
    console.log(`🔒 Mapping classification "${classification}" to "${mappedClassification}"`);
    
    // Save document metadata to database
    const document = await prisma.documents.create({
      data: {
        id: randomUUID(),
        filename: filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: storagePath, // Storage path (Supabase path or filesystem path)
        url: storageUrl, // Storage URL (Supabase signed/public URL or null for filesystem)
        category: mappedCategory as any,
        description: extractedMetadata.title || extractedMetadata.subject || title,
        tags: extractedKeywords.length > 0 ? extractedKeywords : [],
        classification: mappedClassification as any,
        accessLevel: accessLevel || 'organization',
        isPublic: classification === 'PUBLIC',
        uploadedBy: extractedMetadata.author || uploadedBy || session.user?.name || session.user?.email || 'Unknown User',
        department: department || 'Unknown Department',
        folderPath: documentFolderPath,
        projectId: projectId || null,
        version: documentVersion || '1.0',
        isPersonalRepo: isPersonalRepo,
        approvalStatus: status === 'APPROVED' ? 'APPROVED' : (isPersonalRepo ? 'DRAFT' : 'PENDING_REVIEW'),
        reviewStatus: status === 'APPROVED' ? 'APPROVED' : 'PENDING',
        customMetadata: {
          ...(eventId ? { eventId } : {}),
          ...(projectId ? { projectId } : {}),
          ...(projectName ? { projectName } : {}),
          ...(projectCode ? { projectCode } : {}),
          ...(documentYear ? { year: documentYear } : {}),
          ...(documentDate ? { date: documentDate } : {}),
          ...(documentVersion ? { version: documentVersion } : {}),
          ...(selectedIndividuals.length > 0 ? { selectedIndividuals } : {}),
          ...(selectedDepartments.length > 0 ? { selectedDepartments } : {}),
          ...(selectedTeams.length > 0 ? { selectedTeams } : {}),
          accessLevel: accessLevel || 'organization',
          categoryDisplay: finalCategoryDisplay,
          categoryLabel,
          // Storage provider information
          storageProvider: storageProvider,
          storageBucket: storageProvider === 'supabase' ? 'documents' : null,
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
        category: mappedCategory,
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
