import type { documents } from '@prisma/client'

type DocWithProject = documents & {
  projects?: { name: string } | null
}

const EXT_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  md: 'text/markdown',
  html: 'text/html',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

function inferMimeFromFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return 'application/octet-stream'
  return EXT_MIME[ext] || 'application/octet-stream'
}

/**
 * Align single-document API output with list API resolution (folderPath, customMetadata)
 * and stable display fields for detail / preview UIs.
 */
type UploadedByUserRow = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
}

export function enrichDocumentDetailJson(
  document: DocWithProject,
  uploadedByUser: UploadedByUserRow | null
) {
  const customMetadata =
    document.customMetadata && typeof document.customMetadata === 'object' && !Array.isArray(document.customMetadata)
      ? (document.customMetadata as Record<string, unknown>)
      : {}

  let resolvedDepartment =
    document.department || (typeof customMetadata.department === 'string' ? customMetadata.department : null) || null
  let resolvedCategory =
    (document.category != null ? String(document.category) : '') ||
    (typeof customMetadata.category === 'string' ? customMetadata.category : '')
  const folderPath = document.folderPath

  if (folderPath) {
    const pathSegments = folderPath.split('/').filter(Boolean)
    if (!resolvedDepartment && pathSegments.length > 0) {
      resolvedDepartment = pathSegments[0]
    }
    if (!resolvedCategory && pathSegments.length > 0) {
      resolvedCategory = pathSegments[pathSegments.length - 1]
    }
  }

  if (!resolvedDepartment && resolvedCategory) {
    resolvedDepartment = 'General'
  }

  if (!resolvedDepartment && document.mimeType) {
    const mimeRoot = document.mimeType.split('/')[0]
    resolvedDepartment = mimeRoot.charAt(0).toUpperCase() + mimeRoot.slice(1)
  }

  if (!resolvedCategory) {
    resolvedCategory = 'General'
  }

  const originalName = (document.originalName || '').trim() || (document.filename || '').trim()
  const filename = (document.filename || '').trim() || (document.originalName || '').trim()
  let mimeType = (document.mimeType || '').trim()
  if (!mimeType) {
    mimeType = inferMimeFromFilename(originalName || filename)
  }

  const projectInfo = document.projects
  const categoryDisplay =
    (typeof customMetadata.categoryDisplay === 'string' && customMetadata.categoryDisplay) || resolvedCategory

  const uploadedByUserOut = uploadedByUser
    ? {
        id: uploadedByUser.id,
        firstName: uploadedByUser.firstName ?? '',
        lastName: uploadedByUser.lastName ?? '',
        email: uploadedByUser.email ?? '',
      }
    : null

  return {
    id: document.id,
    filename: filename || originalName,
    originalName: originalName || filename,
    title: originalName || filename,
    fileName: filename || originalName,
    mimeType,
    size: typeof document.size === 'number' && Number.isFinite(document.size) ? document.size : 0,
    category: resolvedCategory,
    categoryDisplay,
    classification: String(document.classification || document.accessLevel || 'PUBLIC'),
    description: document.description,
    tags: document.tags ?? [],
    isPublic: document.isPublic,
    uploadedBy: document.uploadedBy,
    uploadedByUser: uploadedByUserOut,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    customMetadata: document.customMetadata,
    url: document.url,
    path: document.path,
    department: resolvedDepartment,
    folderPath: document.folderPath || (resolvedDepartment && resolvedCategory ? `${resolvedDepartment}/${resolvedCategory}` : null),
    projectId: document.projectId || (typeof customMetadata.projectId === 'string' ? customMetadata.projectId : null),
    projectName: projectInfo?.name || (typeof customMetadata.projectName === 'string' ? customMetadata.projectName : null),
  }
}
