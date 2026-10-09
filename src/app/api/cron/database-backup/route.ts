import { NextRequest, NextResponse } from 'next/server'
import { createDatabaseBackup, getBackupSchedule, scheduledBackupIsDue } from '@/lib/database-backup'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const schedule = await getBackupSchedule()
    if (!scheduledBackupIsDue(schedule)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'Automated backup is not due',
        schedule,
      })
    }

    const backup = await createDatabaseBackup({ trigger: 'scheduled', userId: 'system' })
    return NextResponse.json({ success: true, backup })
  } catch (error) {
    console.error('Scheduled database backup failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scheduled backup failed' },
      { status: 500 }
    )
  }
}
