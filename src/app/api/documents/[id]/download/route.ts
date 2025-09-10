import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = session.user?.permissions?.includes('documents.view') ||
                         session.user?.permissions?.includes('documents.full_access') ||
                         session.user?.roles?.includes('admin')

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: id }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check access level permissions
    const userCanAccess = document.accessLevel === 'PUBLIC' ||
                         document.uploadedBy === session.user?.id ||
                         session.user?.roles?.includes('admin') ||
                         session.user?.roles?.includes('manager')

    if (!userCanAccess) {
      return NextResponse.json({ error: 'Access denied to this document' }, { status: 403 })
    }

    // TODO: Add download tracking to schema if needed
    // For now, just return the file without incrementing download count

    // For production, you would typically serve files from cloud storage
    // For now, we'll return the file URL or serve from local storage
    if (document.url) {
      return NextResponse.redirect(document.url)
    }

    // If file is stored locally
    if (document.path && fs.existsSync(document.path)) {
      const fileBuffer = fs.readFileSync(document.path)
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': document.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${document.originalName}"`,
          'Content-Length': document.size.toString()
        }
      })
    }

    return NextResponse.json({ error: 'File not found' }, { status: 404 })

  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
