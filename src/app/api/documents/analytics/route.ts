import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** Matches documents returned by GET /api/documents (non-deleted only). */
const listScope = { isDeleted: false as const }

function formatStorage(bytes: number | null | undefined): string {
  const n = typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : 0
  if (n <= 0) return '0 MB'
  const mb = n / (1024 * 1024)
  if (mb < 1024) return `${mb < 1 ? (n / 1024).toFixed(1) : mb.toFixed(1)} ${mb < 1 ? 'KB' : 'MB'}`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Dashboard cards on /documents: totals, storage, views this calendar month, items shared with current user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id ?? null
    const userEmail = session.user.email ?? null

    const [totalDocuments, sizeAggregate, viewsThisMonth, sharedWithMe] = await Promise.all([
      prisma.documents.count({ where: listScope }),
      prisma.documents.aggregate({
        where: listScope,
        _sum: { size: true },
      }),
      (() => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return prisma.document_audit_logs.count({
          where: {
            action: 'VIEWED',
            timestamp: { gte: startOfMonth },
            documents: listScope,
          },
        })
      })(),
      (async () => {
        const sharedDocIds = new Set<string>()

        const permissionFilters: { userId?: string; userEmail?: string }[] = []
        if (userId) permissionFilters.push({ userId })
        if (userEmail) permissionFilters.push({ userEmail })

        if (permissionFilters.length > 0) {
          const permissionDocs = await prisma.document_permissions.findMany({
            where: {
              documentId: { not: null },
              OR: permissionFilters,
              documents: { isDeleted: false, isPersonalRepo: false },
            },
            select: { documentId: true },
          })
          permissionDocs.forEach((e) => {
            if (e.documentId) sharedDocIds.add(e.documentId)
          })
        }

        const shareFilters: { sharedWith?: string; sharedWithEmail?: string }[] = []
        if (userId) shareFilters.push({ sharedWith: userId })
        if (userEmail) shareFilters.push({ sharedWithEmail: userEmail })

        if (shareFilters.length > 0) {
          const shareDocs = await prisma.document_shares.findMany({
            where: {
              isActive: true,
              OR: shareFilters,
              documents: { isDeleted: false, isPersonalRepo: false },
            },
            select: { documentId: true },
          })
          shareDocs.forEach((e) => sharedDocIds.add(e.documentId))
        }

        if (userId) {
          const individualShares = await prisma.documents.findMany({
            where: {
              isDeleted: false,
              isPersonalRepo: false,
              customMetadata: { path: ['selectedIndividuals'], array_contains: userId },
            },
            select: { id: true },
          })
          individualShares.forEach((d) => sharedDocIds.add(d.id))
        }

        let userDepartment: string | null = null
        if (userId) {
          const employeeRecord = await prisma.employees.findUnique({
            where: { userId },
            select: { department: true },
          })
          userDepartment = employeeRecord?.department ?? null
        }

        if (userDepartment) {
          const departmentShares = await prisma.documents.findMany({
            where: {
              isDeleted: false,
              isPersonalRepo: false,
              customMetadata: { path: ['selectedDepartments'], array_contains: userDepartment },
            },
            select: { id: true },
          })
          departmentShares.forEach((d) => sharedDocIds.add(d.id))
        }

        return sharedDocIds.size
      })(),
    ])

    const storageUsed = formatStorage(sizeAggregate._sum.size ?? 0)

    return NextResponse.json({
      totalDocuments,
      storageUsed,
      viewsThisMonth,
      sharedWithMe,
    })
  } catch (error) {
    console.error('GET /api/documents/analytics:', error)
    return NextResponse.json({ error: 'Failed to load document analytics' }, { status: 500 })
  }
}
