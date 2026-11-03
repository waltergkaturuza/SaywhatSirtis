import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/error-handler'

type SearchHit = {
  id: string
  title: string
  description: string
  type: 'user' | 'document' | 'page' | 'setting' | 'project' | 'call' | 'hr' | 'inventory'
  url: string
}

const CATEGORIES = ['user', 'document', 'page', 'setting', 'project', 'call', 'hr', 'inventory'] as const

function can(permissions: string[], elevated: boolean, required: string[]) {
  if (!required.length) return true
  if (elevated) return true
  return required.some((permission) => permissions.includes(permission))
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const permissions = session.user.permissions || []
    const roles = (session.user.roles || []).map((role) =>
      String(role).toLowerCase().replace(/[\s-]+/g, '_')
    )
    const elevated =
      permissions.includes('full_access') ||
      roles.some((role) =>
        ['admin', 'superuser', 'super_admin', 'system_administrator', 'administrator'].includes(role)
      )

    const access = {
      user: can(permissions, elevated, ['admin.users', 'admin.access']),
      document: can(permissions, elevated, ['documents.view', 'documents.full_access', 'documents_view']),
      page: true,
      setting: can(permissions, elevated, ['admin.settings', 'admin.access']),
      project: can(permissions, elevated, ['programs.view']),
      call: can(permissions, elevated, ['callcentre.access', 'calls.view', 'callcentre.officer', 'calls.full_access']),
      hr: can(permissions, elevated, ['hr.view', 'hr.full_access']),
      inventory: can(permissions, elevated, ['inventory.view']),
    }

    const seeRestrictedDocuments =
      elevated ||
      permissions.includes('documents.full_access') ||
      permissions.includes('documents.security') ||
      permissions.includes('admin.access')

    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') || '').trim()
    const requestedType = searchParams.get('type')
    const type = CATEGORIES.includes(requestedType as (typeof CATEGORIES)[number])
      ? (requestedType as (typeof CATEGORIES)[number])
      : null

    const pages: SearchHit[] = [
      { id: 'page-dashboard', title: 'Dashboard', description: 'Main dashboard', type: 'page', url: '/dashboard' },
      { id: 'page-users', title: 'User Management', description: 'Manage system users', type: 'user', url: '/admin/users' },
      { id: 'page-employees', title: 'Employee Directory', description: 'Employee records', type: 'hr', url: '/hr/employees' },
      { id: 'page-performance', title: 'Performance Plans', description: 'Plans and appraisals', type: 'hr', url: '/hr/performance' },
      { id: 'page-training', title: 'Training', description: 'Employee training', type: 'hr', url: '/hr/training' },
      { id: 'page-settings', title: 'System Settings', description: 'Organization settings', type: 'setting', url: '/settings' },
      { id: 'page-audit', title: 'Audit Logs', description: 'System audit logs', type: 'setting', url: '/admin/audit' },
      { id: 'page-programs', title: 'Programs', description: 'Projects and programs', type: 'project', url: '/programs' },
      { id: 'page-inventory', title: 'Inventory', description: 'Assets and inventory', type: 'inventory', url: '/inventory' },
      { id: 'page-calls', title: 'Call Centre', description: 'Calls and cases', type: 'call', url: '/call-centre' },
      { id: 'page-documents', title: 'Documents', description: 'Document repository', type: 'document', url: '/documents' },
    ].filter((page) => access[page.type] && (!type || type === 'page' || page.type === type))

    const needle = query.toLowerCase()
    const visiblePages = type === 'page'
      ? pages.map((page) => ({ ...page, id: `nav-${page.id}`, type: 'page' as const }))
      : pages
    const matchingPages = query.length >= 2
      ? visiblePages.filter((page) =>
          page.title.toLowerCase().includes(needle) || page.description.toLowerCase().includes(needle)
        )
      : type
        ? visiblePages
        : []

    const results: SearchHit[] = [...matchingPages]
    const take = query.length >= 2 || type ? 8 : 0

    const tasks: Array<Promise<void>> = []

    if (take && access.user && (!type || type === 'user')) {
      tasks.push((async () => {
        const users = await prisma.users.findMany({
          where: query.length >= 2 ? {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          } : undefined,
          orderBy: { createdAt: 'desc' },
          take,
          select: { id: true, firstName: true, lastName: true, email: true, position: true, department: true },
        })
        users.forEach((user) => {
          const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
          results.push({
            id: `user-${user.id}`,
            title: name,
            description: `${user.position || 'User'} - ${user.department || user.email}`,
            type: 'user',
            url: '/admin/users',
          })
        })
      })())
    }

    if (take && access.hr && (!type || type === 'hr')) {
      tasks.push((async () => {
        const employees = await prisma.employees.findMany({
          where: query.length >= 2 ? {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { position: { contains: query, mode: 'insensitive' } },
            ],
          } : undefined,
          orderBy: { createdAt: 'desc' },
          take,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            departments: { select: { name: true } },
          },
        })
        employees.forEach((employee) => {
          const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email || 'Employee'
          results.push({
            id: `employee-${employee.id}`,
            title: name,
            description: `${employee.position || 'Employee'} - ${employee.departments?.name || 'No department'}`,
            type: 'hr',
            url: `/hr/employees?q=${encodeURIComponent(name)}`,
          })
        })
      })())
    }

    if (take && access.document && (!type || type === 'document')) {
      tasks.push((async () => {
        const documents = await prisma.documents.findMany({
          where: {
            isDeleted: false,
            ...(seeRestrictedDocuments ? {} : { classification: { in: ['PUBLIC', 'INTERNAL'] } }),
            NOT: { tags: { has: 'database-backup' } },
            ...(query.length >= 2 ? {
              OR: [
                { originalName: { contains: query, mode: 'insensitive' } },
                { filename: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take,
          select: { id: true, originalName: true, filename: true, description: true, classification: true, isPersonalRepo: true, uploadedBy: true },
        })
        documents.forEach((document) => {
          if (document.isPersonalRepo && document.uploadedBy !== session.user.id && !seeRestrictedDocuments) return
          results.push({
            id: `document-${document.id}`,
            title: document.originalName || document.filename,
            description: document.description || document.classification,
            type: 'document',
            url: `/documents/${document.id}`,
          })
        })
      })())
    }

    if (take && access.project && (!type || type === 'project')) {
      tasks.push((async () => {
        const projects = await prisma.projects.findMany({
          where: query.length >= 2 ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          } : undefined,
          orderBy: { updatedAt: 'desc' },
          take,
          select: { id: true, name: true, status: true, description: true },
        })
        projects.forEach((project) => {
          results.push({
            id: `project-${project.id}`,
            title: project.name,
            description: project.status || project.description || 'Project',
            type: 'project',
            url: `/programs/projects/${project.id}`,
          })
        })
      })())
    }

    if (take && access.call && (!type || type === 'call')) {
      tasks.push((async () => {
        const calls = await prisma.call_records.findMany({
          where: query.length >= 2 ? {
            OR: [
              { callNumber: { contains: query, mode: 'insensitive' } },
              { caseNumber: { contains: query, mode: 'insensitive' } },
              { callerName: { contains: query, mode: 'insensitive' } },
              { subject: { contains: query, mode: 'insensitive' } },
              { purpose: { contains: query, mode: 'insensitive' } },
            ],
          } : undefined,
          orderBy: { createdAt: 'desc' },
          take,
          select: { id: true, callNumber: true, caseNumber: true, callerName: true, purpose: true, isCase: true, subject: true },
        })
        calls.forEach((call) => {
          const isCase = call.isCase === 'YES'
          const label = isCase ? (call.caseNumber || call.subject) : (call.callNumber || call.subject)
          results.push({
            id: `call-${call.id}`,
            title: label || call.callerName,
            description: `${isCase ? 'Case' : 'Call'} - ${call.purpose || call.callerName}`,
            type: 'call',
            url: isCase ? `/call-centre/cases/${call.id}` : `/call-centre/all-calls?q=${encodeURIComponent(label || '')}`,
          })
        })
      })())
    }

    if (take && access.inventory && (!type || type === 'inventory')) {
      tasks.push((async () => {
        const assets = await prisma.assets.findMany({
          where: query.length >= 2 ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { assetTag: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ],
          } : undefined,
          orderBy: { updatedAt: 'desc' },
          take,
          select: { id: true, name: true, assetTag: true, category: true },
        })
        assets.forEach((asset) => {
          results.push({
            id: `asset-${asset.id}`,
            title: asset.name,
            description: `${asset.assetTag} - ${asset.category}`,
            type: 'inventory',
            url: '/inventory',
          })
        })
      })())
    }

    await Promise.all(tasks.map((task) => task.catch((error) => {
      console.error('Search source failed:', error)
    })))

    const unique = new Map<string, SearchHit>()
    results.forEach((result) => {
      if (!unique.has(result.id)) unique.set(result.id, result)
    })

    return NextResponse.json({
      success: true,
      access,
      results: Array.from(unique.values()).slice(0, 20),
    })
  } catch (error) {
    console.error('Search error:', error)
    return createErrorResponse(error, request.url)
  }
}
