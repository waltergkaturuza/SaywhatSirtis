import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { downloadFromSupabaseStorage } from '@/lib/storage/supabase-storage'

const RISK_DOCS_BUCKET = 'risk-documents'

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

    const document = await prisma.risk_documents.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const useSupabase =
      !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    const path = document.filePath || ''

    if (useSupabase && path.startsWith(`${RISK_DOCS_BUCKET}/`)) {
      try {
        const dl = await downloadFromSupabaseStorage(RISK_DOCS_BUCKET, path)
        if (dl.success && dl.data) {
          return new NextResponse(new Uint8Array(dl.data), {
            headers: {
              'Content-Type': document.mimeType || 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${document.originalName}"`,
              'Content-Length': String(dl.data.length),
            },
          })
        }
      } catch (e) {
        console.warn('Supabase risk document download failed, trying disk:', e)
      }
    }

    const absPath = join(process.cwd(), path)
    try {
      const fileBuffer = await readFile(absPath)
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': document.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${document.originalName}"`,
          'Content-Length': String(fileBuffer.length),
        },
      })
    } catch {
      return NextResponse.json(
        {
          error: 'File not found',
          message:
            'The file is not available on disk or in storage. If using Supabase, confirm the object path matches the upload.',
        },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
