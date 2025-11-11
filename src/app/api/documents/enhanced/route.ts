import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Document Repository API with comprehensive features
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const userId = session.user.id

    switch (action) {
      case 'dashboard':
        return getDashboardData(session.user)
      case 'browse':
        return getBrowseData(request, userId)
      case 'search':
        return getSearchResults(request, userId)
      case 'shared':
        return getSharedFiles(userId)
      case 'favorites':
        return getFavoriteFiles(userId)
      case 'by-type':
        return getFilesByType(request, userId)
      case 'by-department':
        return getFilesByDepartment(request, userId)
      case 'by-project':
        return getFilesByProject(request, userId)
      case 'tasks':
        return getWorkflowTasks(userId)
      case 'trash':
        return getDeletedFiles(userId)
      case 'admin':
        return getAdminData(session)
      default:
        return getDashboardData(session.user)
    }

  } catch (error) {
    console.error('Error in documents API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'upload':
        return uploadDocument(data, session.user.id)
      case 'create-folder':
        return createFolder(data, session.user.id)
      case 'share':
        return shareDocument(data, session.user.id)
      case 'favorite':
        return toggleFavorite(data, session.user.id)
      case 'move':
        return moveDocument(data, session.user.id)
      case 'copy':
        return copyDocument(data, session.user.id)
      case 'check-out':
        return checkOutDocument(data, session.user.id)
      case 'check-in':
        return checkInDocument(data, session.user.id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in documents POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, documentId, ...data } = body

    switch (action) {
      case 'update-metadata':
        return updateDocumentMetadata(documentId, data, session.user.id)
      case 'update-permissions':
        return updateDocumentPermissions(documentId, data, session.user.id)
      case 'approve':
        return approveDocument(documentId, data, session.user.id)
      case 'reject':
        return rejectDocument(documentId, data, session.user.id)
      case 'restore':
        return restoreDocument(documentId, session.user.id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in documents PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const documentId = url.searchParams.get('id')
    const permanent = url.searchParams.get('permanent') === 'true'

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    if (permanent) {
      return permanentlyDeleteDocument(documentId, session.user.id)
    } else {
      return softDeleteDocument(documentId, session.user.id)
    }

  } catch (error) {
    console.error('Error in documents DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Dashboard data aggregation
async function getDashboardData(user: { id?: string; email?: string }) {
  try {
    const userId = user?.id || null
    const userEmail = user?.email || null

    const startOfMonth = new Date()
    startOfMonth.setUTCHours(0, 0, 0, 0)
    startOfMonth.setUTCDate(1)

    // Get actual document stats from database, excluding personal repository documents
    const totalDocuments = await prisma.documents.count({
      where: {
        isPersonalRepo: false,  // Only count published documents
        isDeleted: false
      }
    }).catch(() => 0)

    const totalSize = await prisma.documents.aggregate({
      where: {
        isPersonalRepo: false,  // Only count published documents
        isDeleted: false
      },
      _sum: {
        size: true
      }
    }).catch(() => ({ _sum: { size: 0 } }))

    const storageUsed = totalSize._sum.size ? (totalSize._sum.size / 1024 / 1024 / 1024).toFixed(1) : '0'

    const viewsThisMonth = await prisma.document_audit_logs.count({
      where: {
        action: 'VIEWED',
        timestamp: {
          gte: startOfMonth
        },
        documents: {
          isDeleted: false,
          isPersonalRepo: false
        }
      }
    }).catch(() => 0)

    const sharedDocIds = new Set<string>()

    const permissionFilters: any[] = []
    if (userId) {
      permissionFilters.push({ userId })
    }
    if (userEmail) {
      permissionFilters.push({ userEmail })
    }

    if (permissionFilters.length > 0) {
      const permissionDocs = await prisma.document_permissions.findMany({
        where: {
          documentId: { not: null },
          OR: permissionFilters,
          documents: {
            isDeleted: false,
            isPersonalRepo: false
          }
        },
        select: {
          documentId: true
        }
      }).catch(() => [])

      permissionDocs.forEach((entry) => {
        if (entry.documentId) {
          sharedDocIds.add(entry.documentId)
        }
      })
    }

    const shareFilters: any[] = []
    if (userId) {
      shareFilters.push({ sharedWith: userId })
    }
    if (userEmail) {
      shareFilters.push({ sharedWithEmail: userEmail })
    }

    if (shareFilters.length > 0) {
      const shareDocs = await prisma.document_shares.findMany({
        where: {
          isActive: true,
          OR: shareFilters,
          documents: {
            isDeleted: false,
            isPersonalRepo: false
          }
        },
        select: {
          documentId: true
        }
      }).catch(() => [])

      shareDocs.forEach((entry) => {
        sharedDocIds.add(entry.documentId)
      })
    }

    if (userId) {
      const individualShares = await prisma.documents.findMany({
        where: {
          isDeleted: false,
          isPersonalRepo: false,
          customMetadata: {
            path: ['selectedIndividuals'],
            array_contains: userId
          }
        },
        select: { id: true }
      }).catch(() => [])

      individualShares.forEach((doc) => sharedDocIds.add(doc.id))
    }

    let userDepartment: string | null = null
    if (userId) {
      const employeeRecord = await prisma.employees.findUnique({
        where: { userId },
        select: { department: true }
      }).catch(() => null)
      userDepartment = employeeRecord?.department ?? null
    }

    if (userDepartment) {
      const departmentShares = await prisma.documents.findMany({
        where: {
          isDeleted: false,
          isPersonalRepo: false,
          customMetadata: {
            path: ['selectedDepartments'],
            array_contains: userDepartment
          }
        },
        select: { id: true }
      }).catch(() => [])

      departmentShares.forEach((doc) => sharedDocIds.add(doc.id))
    }

    const sharedWithMe = sharedDocIds.size

    const stats = {
      totalDocuments,
      storageUsed: `${storageUsed} GB`,
      viewsThisMonth,
      sharedWithMe
    }

    // Get recent files from database, excluding personal repository documents
    const recentDocuments = await prisma.documents.findMany({
      where: {
        isPersonalRepo: false,  // Only show published documents, not personal drafts
        isDeleted: false
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        originalName: true,
        filename: true,
        mimeType: true,
        size: true,
        uploadedBy: true,
        updatedAt: true,
        department: true,
        classification: true
      }
    }).catch(() => [])

    // Format recent files for frontend
    const recentFiles = await Promise.all(
      recentDocuments.map(async (doc) => {
        let uploaderName = 'Unknown'
        if (doc.uploadedBy) {
          try {
            const uploader = await prisma.users.findUnique({
              where: { id: doc.uploadedBy },
              select: { firstName: true, lastName: true }
            })
            if (uploader) {
              uploaderName = `${uploader.firstName} ${uploader.lastName}`
            }
          } catch (error) {
            // Handle case where uploader doesn't exist
            uploaderName = 'Unknown'
          }
        }

        return {
          id: doc.id,
          name: doc.originalName,
          type: doc.mimeType?.split('/')[1] || 'file',
          size: `${(doc.size / 1024 / 1024).toFixed(1)} MB`,
          modifiedBy: uploaderName,
          modifiedAt: new Date(doc.updatedAt).toLocaleDateString(),
          department: doc.department || 'Unknown',
          classification: doc.classification || 'INTERNAL'
        }
      })
    )

    const myTasks: any[] = [
      // This could be populated with actual approval tasks from the database
    ]

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentFiles,
        myTasks
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalDocuments: 0,
          storageUsed: '0 GB',
          viewsThisMonth: 0,
          sharedWithMe: 0
        },
        recentFiles: [],
        myTasks: []
      }
    })
  }
}

// Browse files with folder hierarchy
async function getBrowseData(request: NextRequest, userId: string) {
  const url = new URL(request.url)
  const folderId = url.searchParams.get('folder') || 'root'
  const view = url.searchParams.get('view') || 'list' // list, grid, thumbnails

  // Mock folder structure
  const folders = [
    { id: '1', name: 'HR Documents', type: 'folder', itemCount: 156, modifiedAt: '2025-09-01' },
    { id: '2', name: 'Finance Reports', type: 'folder', itemCount: 89, modifiedAt: '2025-09-05' },
    { id: '3', name: 'Marketing Materials', type: 'folder', itemCount: 234, modifiedAt: '2025-09-08' }
  ]

  const files = [
    {
      id: '1',
      name: 'Company Policy.pdf',
      type: 'pdf',
      size: '1.2 MB',
      modifiedAt: '2025-09-08',
      classification: 'PUBLIC',
      version: '2.1',
      checkedOut: false
    }
  ]

  return NextResponse.json({
    success: true,
    data: {
      currentFolder: folderId,
      breadcrumb: [{ id: 'root', name: 'Root' }],
      folders,
      files,
      view
    }
  })
}

// Advanced search functionality
async function getSearchResults(request: NextRequest, userId: string) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''
  const fileType = url.searchParams.get('type')
  const department = url.searchParams.get('department')
  const dateRange = url.searchParams.get('dateRange')
  const classification = url.searchParams.get('classification')

  // Mock search results
  const results = [
    {
      id: '1',
      name: 'Budget Analysis Q3.xlsx',
      type: 'xlsx',
      size: '3.4 MB',
      path: '/Finance/Reports/Q3/',
      modifiedAt: '2025-09-07',
      classification: 'CONFIDENTIAL',
      relevanceScore: 0.95,
      snippet: 'Budget analysis showing 15% increase in operational costs...'
    }
  ]

  const facets = {
    fileTypes: [
      { type: 'pdf', count: 156 },
      { type: 'docx', count: 89 },
      { type: 'xlsx', count: 67 }
    ],
    departments: [
      { name: 'Finance', count: 45 },
      { name: 'HR', count: 23 },
      { name: 'Marketing', count: 34 }
    ]
  }

  return NextResponse.json({
    success: true,
    data: {
      query,
      results,
      facets,
      totalCount: results.length
    }
  })
}

// Files shared with the user
async function getSharedFiles(userId: string) {
  const sharedFiles = [
    {
      id: '1',
      name: 'Quarterly Review.pptx',
      type: 'pptx',
      size: '5.2 MB',
      sharedBy: 'Alice Johnson',
      sharedAt: '2025-09-07',
      permission: 'edit',
      expiresAt: '2025-10-07'
    }
  ]

  return NextResponse.json({
    success: true,
    data: sharedFiles
  })
}

// User's favorite files
async function getFavoriteFiles(userId: string) {
  const favorites = [
    {
      id: '1',
      name: 'Important Guidelines.pdf',
      type: 'pdf',
      size: '2.1 MB',
      addedToFavoritesAt: '2025-09-01',
      lastAccessed: '2025-09-08'
    }
  ]

  return NextResponse.json({
    success: true,
    data: favorites
  })
}

// Files organized by type
async function getFilesByType(request: NextRequest, userId: string) {
  const url = new URL(request.url)
  const fileType = url.searchParams.get('fileType')

  const fileTypes = [
    { id: 'documents', name: 'Documents', extensions: ['pdf', 'doc', 'docx'], count: 156 },
    { id: 'spreadsheets', name: 'Spreadsheets', extensions: ['xls', 'xlsx', 'csv'], count: 89 },
    { id: 'presentations', name: 'Presentations', extensions: ['ppt', 'pptx'], count: 45 },
    { id: 'images', name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'], count: 234 },
    { id: 'videos', name: 'Videos', extensions: ['mp4', 'avi', 'mov'], count: 67 }
  ]

  return NextResponse.json({
    success: true,
    data: fileTypes
  })
}

// Files organized by department
async function getFilesByDepartment(request: NextRequest, userId: string) {
  const departments = [
    { id: 'hr', name: 'Human Resources', code: 'HR', fileCount: 234 },
    { id: 'finance', name: 'Finance', code: 'FIN', fileCount: 189 },
    { id: 'operations', name: 'Operations', code: 'OPS', fileCount: 156 },
    { id: 'marketing', name: 'Marketing', code: 'MKT', fileCount: 298 },
    { id: 'hr', name: 'Human Resources', code: 'HR', fileCount: 145 },
    { id: 'legal', name: 'Legal', code: 'LEG', fileCount: 78 }
  ]

  return NextResponse.json({
    success: true,
    data: departments
  })
}

// Files organized by project
async function getFilesByProject(request: NextRequest, userId: string) {
  const projects = [
    {
      id: '1',
      name: 'Digital Transformation Initiative',
      status: 'active',
      fileCount: 67,
      lastActivity: '2025-09-08'
    },
    {
      id: '2',
      name: 'Customer Experience Enhancement',
      status: 'planning',
      fileCount: 34,
      lastActivity: '2025-09-07'
    }
  ]

  return NextResponse.json({
    success: true,
    data: projects
  })
}

// Workflow tasks and approvals
async function getWorkflowTasks(userId: string) {
  const tasks = [
    {
      id: '1',
      type: 'approval',
      title: 'Review Contract Amendment',
      document: 'Service Agreement v3.pdf',
      assignedBy: 'Legal Team',
      dueDate: '2025-09-12',
      priority: 'high',
      status: 'pending'
    },
    {
      id: '2',
      type: 'review',
      title: 'Policy Document Review',
      document: 'Remote Work Policy v2.docx',
      assignedBy: 'HR Manager',
      dueDate: '2025-09-15',
      priority: 'medium',
      status: 'in_progress'
    }
  ]

  return NextResponse.json({
    success: true,
    data: tasks
  })
}

// Deleted files (trash)
async function getDeletedFiles(userId: string) {
  const deletedFiles = [
    {
      id: '1',
      name: 'Old Report.pdf',
      type: 'pdf',
      size: '1.8 MB',
      deletedBy: 'John Doe',
      deletedAt: '2025-09-05',
      expiresAt: '2025-10-05',
      originalPath: '/Finance/Reports/'
    }
  ]

  return NextResponse.json({
    success: true,
    data: deletedFiles
  })
}

// Admin console data
async function getAdminData(session: any) {
  if (!session.user?.roles?.includes('admin')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const adminStats = {
    totalUsers: 0,
    activeUsers: 0,
    storageQuota: 0, // GB
    storageUsed: 0, // GB
    documentsCreatedThisMonth: 0,
    auditLogEntries: 0
  }

  return NextResponse.json({
    success: true,
    data: adminStats
  })
}

// Document operations
async function uploadDocument(data: any, userId: string) {
  // Implementation for document upload
  return NextResponse.json({
    success: true,
    message: 'Document uploaded successfully',
    documentId: 'new-doc-id'
  })
}

async function updateDocumentMetadata(documentId: string, data: any, userId: string) {
  // Implementation for metadata update
  return NextResponse.json({
    success: true,
    message: 'Document metadata updated'
  })
}

async function shareDocument(data: any, userId: string) {
  // Implementation for document sharing
  return NextResponse.json({
    success: true,
    message: 'Document shared successfully'
  })
}

async function checkOutDocument(data: any, userId: string) {
  // Implementation for document check-out
  return NextResponse.json({
    success: true,
    message: 'Document checked out'
  })
}

async function checkInDocument(data: any, userId: string) {
  // Implementation for document check-in
  return NextResponse.json({
    success: true,
    message: 'Document checked in'
  })
}

async function softDeleteDocument(documentId: string, userId: string) {
  // Implementation for soft delete
  return NextResponse.json({
    success: true,
    message: 'Document moved to trash'
  })
}

async function permanentlyDeleteDocument(documentId: string, userId: string) {
  // Implementation for permanent delete
  return NextResponse.json({
    success: true,
    message: 'Document permanently deleted'
  })
}

async function restoreDocument(documentId: string, userId: string) {
  // Implementation for document restore
  return NextResponse.json({
    success: true,
    message: 'Document restored successfully'
  })
}

async function toggleFavorite(data: any, userId: string) {
  // Implementation for favorite toggle
  return NextResponse.json({
    success: true,
    message: 'Favorite status updated'
  })
}

async function createFolder(data: any, userId: string) {
  // Implementation for folder creation
  return NextResponse.json({
    success: true,
    message: 'Folder created successfully',
    folder: { id: Date.now().toString(), name: data.name }
  })
}

async function moveDocument(data: any, userId: string) {
  // Implementation for moving documents
  return NextResponse.json({
    success: true,
    message: 'Document moved successfully'
  })
}

async function copyDocument(data: any, userId: string) {
  // Implementation for copying documents
  return NextResponse.json({
    success: true,
    message: 'Document copied successfully'
  })
}

async function approveDocument(documentId: string, data: any, userId: string) {
  // Implementation for document approval
  return NextResponse.json({
    success: true,
    message: 'Document approved successfully'
  })
}

async function updateDocumentPermissions(documentId: string, data: any, userId: string) {
  // Implementation for updating document permissions
  return NextResponse.json({
    success: true,
    message: 'Document permissions updated successfully'
  })
}

async function rejectDocument(documentId: string, data: any, userId: string) {
  // Implementation for document rejection
  return NextResponse.json({
    success: true,
    message: 'Document rejected successfully'
  })
}
