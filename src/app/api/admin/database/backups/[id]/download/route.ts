import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { DATABASE_BACKUP_TAG } from '@/lib/database-backup'
import { downloadFromSupabaseStorage } from '@/lib/storage/supabase-storage'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || !hasAdminAccess(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const document = await prisma.documents.findFirst({
    where: {
      id,
      isDeleted: false,
      tags: { has: DATABASE_BACKUP_TAG },
    },
    select: {
      originalName: true,
      mimeType: true,
      path: true,
      customMetadata: true,
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
  }

  const metadata = (document.customMetadata || {}) as { storageBucket?: string; storagePath?: string }
  const bucket = metadata.storageBucket || 'documents'
  const storagePath = metadata.storagePath || document.path
  const downloaded = await downloadFromSupabaseStorage(bucket, storagePath)
  if (!downloaded.success || !downloaded.data) {
    return NextResponse.json(
      { error: downloaded.error || 'Could not download the backup file' },
      { status: 502 }
    )
  }

  await prisma.documents.update({
    where: { id },
    data: {
      downloadCount: { increment: 1 },
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    },
  }).catch(() => undefined)

  const filename = document.originalName || 'database-backup.json'
  return new NextResponse(new Uint8Array(downloaded.data), {
    headers: {
      'Content-Type': document.mimeType || 'application/json',
      'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
      'Cache-Control': 'no-store',
    },
  })
}
