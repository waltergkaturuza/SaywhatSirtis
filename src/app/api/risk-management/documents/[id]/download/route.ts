import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get document from database
    const document = await prisma.riskDocument.findUnique({
      where: { 
        id: id
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    try {
      // Try to read file from filesystem
      const filePath = join(process.cwd(), document.filePath)
      const fileBuffer = await readFile(filePath)
      
      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': document.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${document.originalName}"`,
          'Content-Length': document.fileSize.toString()
        }
      })
      
    } catch (fileError) {
      // File not found on filesystem (demo mode)
      return NextResponse.json({
        error: 'File not available in demo mode',
        message: 'File storage is disabled for demonstration purposes'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
