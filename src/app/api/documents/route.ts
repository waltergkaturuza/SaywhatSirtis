import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - Allow access for all authenticated users with document level filtering
    const hasPermission = session.user?.permissions?.includes('documents.view') ||
                         session.user?.permissions?.includes('documents.full_access') ||
                         session.user?.permissions?.includes('documents') ||
                         session.user?.permissions?.includes('documents_view') ||
                         session.user?.permissions?.includes('documents_edit') ||
                         session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1', 'advance_user_2', 'basic_user_1', 'basic_user_2', 'hr'].includes(role.toLowerCase())) ||
                         session.user; // Allow all authenticated users but filter by document security level

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const eventId = searchParams.get('eventId')
    const employeeId = searchParams.get('employeeId') // Add employee filter

    // Build filter
    const where: any = {
      isDeleted: false
    }

    if (category) {
      where.category = category
    }

    if (eventId) {
      where.customMetadata = {
        path: ['eventId'],
        equals: eventId
      }
    }

    // Add employee filter using custom metadata
    if (employeeId) {
      where.customMetadata = {
        path: ['relatedEmployeeId'],
        equals: employeeId
      }
    }

    if (search) {
      where.OR = [
        {
          filename: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          originalName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Fetch documents from database with safe query
    const documents = await prisma.documents.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        description: true,
        mimeType: true,
        size: true,
        category: true,
        accessLevel: true,
        classification: true,
        tags: true,
        url: true,
        uploadedBy: true,
        createdAt: true,
        updatedAt: true,
        customMetadata: true,
        department: true,
        folderPath: true
      }
    }).catch((error) => {
      console.error('Database query error:', error)
      return []
    })

    // Get uploader details separately if needed
    const documentsWithUploaders = await Promise.all(
      documents.map(async (doc) => {
        let uploaderInfo = null
        if (doc.uploadedBy) {
          try {
            const uploader = await prisma.users.findUnique({
              where: { id: doc.uploadedBy },
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            })
            uploaderInfo = uploader ? {
              name: `${uploader.firstName} ${uploader.lastName}`,
              email: uploader.email
            } : null
          } catch (error) {
            // Handle case where uploader doesn't exist
            uploaderInfo = null
          }
        }

        const inferExtension = () => {
          const fromOriginal = doc.originalName?.split('.').pop()
          const fromFilename = doc.filename?.split('.').pop()
          const fromMime = doc.mimeType?.split('/').pop()

          return (fromOriginal || fromFilename || fromMime || 'file').toLowerCase()
        }

        const formatFileSize = (sizeValue: number | bigint | null | undefined) => {
          if (sizeValue === null || sizeValue === undefined) return '0 B'
          const sizeNumber = typeof sizeValue === 'bigint' ? Number(sizeValue) : Number(sizeValue)
          if (!Number.isFinite(sizeNumber) || sizeNumber <= 0) return '0 B'
          const megabytes = sizeNumber / (1024 * 1024)
          if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`
          const kilobytes = sizeNumber / 1024
          if (kilobytes >= 1) return `${kilobytes.toFixed(1)} KB`
          return `${sizeNumber} B`
        }

        const uploadDateIso = doc.createdAt.toISOString()
        const uploadedByDisplay = uploaderInfo?.name?.trim() || (typeof doc.uploadedBy === 'string' ? doc.uploadedBy : 'Unknown')
        const extension = inferExtension()

        const customMetadata = (doc.customMetadata && typeof doc.customMetadata === 'object' && !Array.isArray(doc.customMetadata)
          ? doc.customMetadata as Record<string, any>
          : {})

        let resolvedDepartment = doc.department || customMetadata.department || null
        let resolvedCategory = doc.category || customMetadata.category || ''
        let resolvedSubunit = customMetadata.subunit || null

        if (doc.folderPath) {
          const pathSegments = doc.folderPath.split('/').filter(Boolean)
          if (!resolvedDepartment && pathSegments.length > 0) {
            resolvedDepartment = pathSegments[0]
          }
          if (!resolvedCategory && pathSegments.length > 0) {
            resolvedCategory = pathSegments[pathSegments.length - 1]
          }
          if (!resolvedSubunit && pathSegments.length > 2) {
            resolvedSubunit = pathSegments.slice(1, pathSegments.length - 1).join('/')
          } else if (!resolvedSubunit && pathSegments.length === 2) {
            const possibleSubunit = pathSegments[1]
            if (possibleSubunit !== resolvedDepartment) {
              resolvedSubunit = possibleSubunit
            }
          }
        }

        if (!resolvedDepartment && resolvedCategory) {
          resolvedDepartment = 'General'
        }

        if (!resolvedDepartment && doc.mimeType) {
          const mimeRoot = doc.mimeType.split('/')[0]
          resolvedDepartment = mimeRoot.charAt(0).toUpperCase() + mimeRoot.slice(1)
        }

        if (!resolvedCategory) {
          resolvedCategory = 'General'
        }

        return {
          id: doc.id,
          title: doc.originalName,
          fileName: doc.filename,
          description: doc.description,
          classification: doc.accessLevel?.toUpperCase() || 'INTERNAL',
          category: resolvedCategory,
          type: extension,
          mimeType: doc.mimeType,
          size: formatFileSize(doc.size),
          uploadDate: uploadDateIso,
          uploadedBy: uploadedByDisplay,
          uploadedByEmail: uploaderInfo?.email || null,
          url: doc.url,
          department: resolvedDepartment,
          folderPath: doc.folderPath || (resolvedDepartment && resolvedCategory ? `${resolvedDepartment}/${resolvedCategory}` : null),
          customMetadata: doc.customMetadata,
          tags: doc.tags,
          canEdit: doc.uploadedBy === session.user?.id,
          canDelete: doc.uploadedBy === session.user?.id || session.user?.roles?.includes('admin')
        }
      })
    )

    return NextResponse.json(documentsWithUploaders)

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - Allow document creation for all users with role-based security level restrictions
    const hasPermission = session.user?.permissions?.includes('documents.create') ||
                         session.user?.permissions?.includes('documents.full_access') ||
                         session.user?.permissions?.includes('documents_edit') ||
                         session.user?.permissions?.includes('documents') ||
                         session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1', 'advance_user_2', 'basic_user_1', 'basic_user_2', 'hr'].includes(role.toLowerCase())) ||
                         session.user; // Allow all authenticated users to create documents

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { filename, originalName, mimeType, size, path, url, category, description, tags, isPublic, accessLevel } = await request.json()

    if (!filename || !originalName || !mimeType || !size || !path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const document = await prisma.documents.create({
      data: {
        id: randomUUID(),
        filename,
        originalName,
        mimeType,
        size,
        path,
        url,
        category,
        description,
        tags: tags || [],
        isPublic: isPublic || false,
        accessLevel: accessLevel || 'internal',
        uploadedBy: session.user?.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      id: document.id,
      title: document.originalName,
      fileName: document.filename,
      url: document.url
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, description, category, tags, isPublic, accessLevel } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Check if document exists and user has permission
    const existingDocument = await prisma.documents.findUnique({
      where: { id }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const canEdit = existingDocument.uploadedBy === session.user?.id ||
                   session.user?.roles?.includes('admin') ||
                   session.user?.permissions?.includes('documents.full_access')

    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const updatedDocument = await prisma.documents.update({
      where: { id },
      data: {
        description: description || existingDocument.description,
        category: category || existingDocument.category,
        tags: tags || existingDocument.tags,
        isPublic: isPublic !== undefined ? isPublic : existingDocument.isPublic,
        accessLevel: accessLevel || existingDocument.accessLevel
      }
    })

    return NextResponse.json({
      id: updatedDocument.id,
      success: true
    })

  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Check if document exists and user has permission
    const existingDocument = await prisma.documents.findUnique({
      where: { id }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const canDelete = existingDocument.uploadedBy === session.user?.id ||
                     session.user?.roles?.includes('admin') ||
                     session.user?.permissions?.includes('documents.full_access')

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await prisma.documents.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
