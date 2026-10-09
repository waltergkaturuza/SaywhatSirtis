import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/admin-auth'
import { exportUserTableCsv } from '@/lib/database-maintenance'

export const maxDuration = 60

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ table: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || !hasAdminAccess(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { table } = await context.params
  try {
    const exported = await exportUserTableCsv(decodeURIComponent(table))
    return new NextResponse(exported.csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${exported.filename}"`,
        'X-Export-Rows': String(exported.rowCount),
        'X-Export-Truncated': exported.truncated ? '1' : '0',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed'
    const status = message === 'Table not found' || message === 'Invalid table name' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
