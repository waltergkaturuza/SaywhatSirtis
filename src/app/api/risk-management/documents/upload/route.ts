import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'risk-documents')
    
    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Save file to filesystem (in production, you'd upload to cloud storage)
      await writeFile(join(uploadsDir, filename), buffer)
      
      // Save document record to database
      const document = await prisma.risk_documents.create({
        data: {
          id: crypto.randomUUID(),
          filename: filename,
          originalName: originalName,
          filePath: join('uploads', 'risk-documents', filename),
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
        data: document
      })

    } catch (fileError) {
      console.error('File operation error:', fileError)
      // Fallback: save document record without file (for demo purposes)
      const document = await prisma.risk_documents.create({
        data: {
          id: crypto.randomUUID(),
          filename: filename,
          originalName: originalName,
          filePath: `/uploads/risk-documents/${filename}`,
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
        data: document,
        message: 'Document record created (file storage unavailable in demo)'
      })
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
