import { NextRequest, NextResponse } from 'next/server'
import { runScheduledBackupIfDue } from '@/lib/database-backup'

export const maxDuration = 60

function cronAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (secret && authorization === `Bearer ${secret}`) return true
  return request.headers.get('x-vercel-cron') === '1'
}

export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runScheduledBackupIfDue()
    if (!result.ran) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'Automated backup is not due',
        schedule: result.schedule,
      })
    }
    return NextResponse.json({ success: true, backup: result.backup })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scheduled backup failed'
    console.error('Scheduled database backup failed:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
