import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/admin/storage/backup
 * 
 * Create a backup manifest of all documents and their storage locations.
 * This can be used for disaster recovery and migration purposes.
 * 
 * Body:
 *   - format: 'json' | 'csv' (default: 'json')
 *   - includeFiles: boolean (default: false) - Include file contents in backup
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const isAdmin = session.user?.roles?.some(role => 
      ['admin', 'hr'].includes(role.toLowerCase())
    ) || session.user?.permissions?.includes('admin.full_access')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const format = body.format || 'json'
    const includeFiles = body.includeFiles === true

    // Fetch all documents
    const documents = await prisma.documents.findMany({
      select: {
        id: true,
        filename: true,
        originalName: true,
        path: true,
        url: true,
        mimeType: true,
        size: true,
        category: true,
        description: true,
        classification: true,
        department: true,
        projectId: true,
        version: true,
        folderPath: true,
        customMetadata: true,
        createdAt: true,
        updatedAt: true,
        uploadedBy: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Create backup manifest
    const manifest = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalDocuments: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        path: doc.path,
        url: doc.url,
        mimeType: doc.mimeType,
        size: doc.size,
        category: doc.category,
        description: doc.description,
        classification: doc.classification,
        department: doc.department,
        projectId: doc.projectId,
        version: doc.version,
        folderPath: doc.folderPath,
        storageProvider: (doc.customMetadata as any)?.storageProvider || 'filesystem',
        storageBucket: (doc.customMetadata as any)?.storageBucket || null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        uploadedBy: doc.uploadedBy
      }))
    }

    // Generate response based on format
    if (format === 'csv') {
      const csvHeaders = [
        'ID', 'Filename', 'Original Name', 'Path', 'URL', 'MIME Type', 'Size',
        'Category', 'Description', 'Classification', 'Department', 'Project ID',
        'Version', 'Folder Path', 'Storage Provider', 'Storage Bucket',
        'Created At', 'Updated At', 'Uploaded By'
      ]

      const csvRows = manifest.documents.map(doc => [
        doc.id,
        doc.filename,
        doc.originalName,
        doc.path,
        doc.url || '',
        doc.mimeType,
        doc.size,
        doc.category || '',
        doc.description || '',
        doc.classification,
        doc.department || '',
        doc.projectId || '',
        doc.version,
        doc.folderPath || '',
        doc.storageProvider,
        doc.storageBucket || '',
        doc.createdAt,
        doc.updatedAt,
        doc.uploadedBy || ''
      ])

      const csv = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="storage-backup-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // JSON format (default)
    return NextResponse.json(manifest, {
      headers: {
        'Content-Disposition': `attachment; filename="storage-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Backup generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate backup', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/storage/backup
 * 
 * Get backup information and status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const isAdmin = session.user?.roles?.some(role => 
      ['admin', 'hr'].includes(role.toLowerCase())
    ) || session.user?.permissions?.includes('admin.full_access')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get backup statistics
    const totalDocuments = await prisma.documents.count()
    const supabaseDocuments = await prisma.documents.count({
      where: {
        customMetadata: {
          path: ['storageProvider'],
          equals: 'supabase'
        }
      }
    })

    const sizeResult = await prisma.documents.aggregate({
      _sum: { size: true }
    })

    return NextResponse.json({
      totalDocuments,
      supabaseDocuments,
      filesystemDocuments: totalDocuments - supabaseDocuments,
      totalSize: sizeResult._sum.size || 0,
      backupFormats: ['json', 'csv'],
      lastBackup: null, // Could be stored in database or file system
      recommendations: [
        'Run backups regularly (weekly recommended)',
        'Store backups in a separate location',
        'Test backup restoration periodically',
        'Consider automated backup solutions'
      ]
    })

  } catch (error) {
    console.error('Backup info error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backup information' },
      { status: 500 }
    )
  }
}
