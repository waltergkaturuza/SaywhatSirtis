import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadToSupabaseStorage, ensureBucketExists } from '@/lib/storage/supabase-storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const riskId = formData.get('riskId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!riskId) {
      return NextResponse.json({ error: 'Risk ID is required' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // Check if risk exists
    const risk = await prisma.risks.findUnique({
      where: { id: riskId }
    })

    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 })
    }

    // Get current user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.substring(originalName.lastIndexOf('.'))
    const filename = `${riskId}_${timestamp}${extension}`

    let storageUrl: string | null = null
    let storagePath: string = ''
    let storageProvider: 'supabase' | 'filesystem' = 'supabase'

    // Determine storage strategy: Use Supabase Storage if configured, otherwise fallback to filesystem
    let useSupabaseStorage = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (useSupabaseStorage) {
      try {
        const bucket = 'risk-documents'
        const storageFilePath = `risk-documents/${riskId}/${filename}`

        // Ensure bucket exists
        await ensureBucketExists(bucket)

        // Upload file to Supabase Storage
        const uploadResult = await uploadToSupabaseStorage({
          bucket,
          path: storageFilePath,
          file,
          contentType: file.type,
          upsert: false
        })

        if (!uploadResult.success) {
          console.error('❌ Supabase Storage upload failed:', uploadResult.error)
          throw new Error(`Supabase upload failed: ${uploadResult.error}`)
        }

        storageUrl = uploadResult.url || uploadResult.publicUrl || null
        storagePath = storageFilePath
        storageProvider = 'supabase'

        console.log(`✅ Risk document uploaded to Supabase Storage: ${storagePath}`)
      } catch (supabaseError) {
        console.error('❌ Supabase Storage error, falling back to filesystem:', supabaseError)
        useSupabaseStorage = false
      }
    }

    // Fallback to filesystem storage
    if (!useSupabaseStorage || !storageUrl) {
      const uploadsDir = join(process.cwd(), 'uploads', 'risk-documents')
      storagePath = join('uploads', 'risk-documents', filename)
      storageProvider = 'filesystem'

      try {
        // Create uploads directory if it doesn't exist
        await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))
        console.log(`✅ Risk document saved to filesystem: ${storagePath}`)
      } catch (fileError) {
        console.error('❌ File save error:', fileError)
        return NextResponse.json({
          success: false,
          error: 'Failed to save file to storage'
        }, { status: 500 })
      }
    }

    // Save document record to database
    try {
      const document = await prisma.risk_documents.create({
        data: {
          id: crypto.randomUUID(),
          filename: filename,
          originalName: originalName,
          filePath: storagePath,
          fileSize: file.size,
          mimeType: file.type,
          riskId: riskId,
          uploadedById: user.id
        },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          ...document,
          storageProvider,
          storageUrl
        }
      })
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to save document record'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riskId = searchParams.get('riskId')

    if (!riskId) {
      return NextResponse.json({ error: 'Risk ID is required' }, { status: 400 })
    }

    // Get documents for the risk
    const documents = await prisma.risk_documents.findMany({
      where: { 
        riskId: riskId
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: documents
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
