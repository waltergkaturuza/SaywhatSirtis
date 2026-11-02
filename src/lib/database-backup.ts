import { randomUUID } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { deleteFromSupabaseStorage, uploadToSupabaseStorage } from '@/lib/storage/supabase-storage'

const BUCKET = 'documents'
export const DATABASE_BACKUP_TAG = 'database-backup'
const SCHEDULE_KEY = 'database_backup_schedule'

export type BackupFrequency = 'daily' | 'weekly'

export interface BackupSchedule {
  enabled: boolean
  frequency: BackupFrequency
  weekday: number
  retentionCount: number
  lastSuccessAt?: string | null
  lastAttemptAt?: string | null
  lastError?: string | null
}

const RUN_HOUR_UTC = 2

const DEFAULT_SCHEDULE: BackupSchedule = {
  enabled: true,
  frequency: 'daily',
  weekday: 0,
  retentionCount: 14,
}

function serializeValue(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value.toString('base64')
  if (Array.isArray(value)) return value.map(serializeValue)
  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      output[key] = serializeValue(nested)
    }
    return output
  }
  return value
}

export function formatBackupBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${Math.round((bytes / Math.pow(1024, index)) * 100) / 100} ${units[index]}`
}

export async function getBackupSchedule(): Promise<BackupSchedule> {
  const row = await prisma.system_config.findUnique({ where: { key: SCHEDULE_KEY } })
  const value = (row?.value || {}) as Partial<BackupSchedule>
  const frequency = value.frequency === 'weekly' ? 'weekly' : 'daily'
  const weekday = Number.isInteger(value.weekday) ? Math.min(6, Math.max(0, Number(value.weekday))) : 0
  const retentionCount = Number.isInteger(value.retentionCount)
    ? Math.min(90, Math.max(1, Number(value.retentionCount)))
    : DEFAULT_SCHEDULE.retentionCount
  const lastScheduled = await latestScheduledBackupAt()
  return {
    enabled: value.enabled !== false,
    frequency,
    weekday,
    retentionCount,
    lastSuccessAt: lastScheduled?.toISOString() || (typeof value.lastSuccessAt === 'string' ? value.lastSuccessAt : null),
    lastAttemptAt: typeof value.lastAttemptAt === 'string' ? value.lastAttemptAt : null,
    lastError: typeof value.lastError === 'string' ? value.lastError : null,
  }
}

async function writeScheduleState(patch: Record<string, unknown>) {
  const row = await prisma.system_config.findUnique({ where: { key: SCHEDULE_KEY } })
  const current = (row?.value && typeof row.value === 'object' ? row.value : {}) as Record<string, unknown>
  const value = { ...current, ...patch }
  await prisma.system_config.upsert({
    where: { key: SCHEDULE_KEY },
    create: {
      id: randomUUID(),
      key: SCHEDULE_KEY,
      value: value as Prisma.InputJsonObject,
      description: 'Automated database backup schedule',
      category: 'backup',
      updatedAt: new Date(),
    },
    update: {
      value: value as Prisma.InputJsonObject,
      updatedAt: new Date(),
    },
  })
}

export async function recordBackupAttempt(result: { ok: boolean; error?: string }) {
  const now = new Date().toISOString()
  await writeScheduleState({
    lastAttemptAt: now,
    lastError: result.ok ? null : (result.error || 'Backup failed'),
    ...(result.ok ? { lastSuccessAt: now } : {}),
  })
}

export async function saveBackupSchedule(input: Partial<BackupSchedule>): Promise<BackupSchedule> {
  const current = await getBackupSchedule()
  const next: BackupSchedule = {
    enabled: typeof input.enabled === 'boolean' ? input.enabled : current.enabled,
    frequency: input.frequency === 'weekly' ? 'weekly' : input.frequency === 'daily' ? 'daily' : current.frequency,
    weekday: Number.isInteger(input.weekday) ? Math.min(6, Math.max(0, Number(input.weekday))) : current.weekday,
    retentionCount: Number.isInteger(input.retentionCount)
      ? Math.min(90, Math.max(1, Number(input.retentionCount)))
      : current.retentionCount,
  }

  await writeScheduleState({
    enabled: next.enabled,
    frequency: next.frequency,
    weekday: next.weekday,
    retentionCount: next.retentionCount,
  })

  return getBackupSchedule()
}

export async function listDatabaseBackups() {
  const documents = await prisma.documents.findMany({
    where: {
      isDeleted: false,
      tags: { has: DATABASE_BACKUP_TAG },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      originalName: true,
      size: true,
      createdAt: true,
      tags: true,
      customMetadata: true,
    },
  })

  return documents.map(document => {
    const metadata = (document.customMetadata || {}) as { trigger?: string; tableCount?: number }
    const scheduled = document.tags.includes('scheduled') || metadata.trigger === 'scheduled'
    return {
      id: document.id,
      filename: document.originalName,
      type: scheduled ? 'Scheduled' : 'Manual',
      size: formatBackupBytes(document.size),
      sizeBytes: document.size,
      createdAt: document.createdAt.toISOString(),
      status: 'completed',
      tableCount: metadata.tableCount ?? null,
    }
  })
}

async function applyRetention(retentionCount: number) {
  const backups = await prisma.documents.findMany({
    where: {
      isDeleted: false,
      tags: { has: DATABASE_BACKUP_TAG },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, path: true, customMetadata: true },
  })

  for (const backup of backups.slice(retentionCount)) {
    const metadata = (backup.customMetadata || {}) as { storageBucket?: string; storagePath?: string }
    const bucket = metadata.storageBucket || BUCKET
    const storagePath = metadata.storagePath || backup.path
    await deleteFromSupabaseStorage(bucket, storagePath)
    await prisma.documents.update({
      where: { id: backup.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: 'backup-retention',
        updatedAt: new Date(),
      },
    })
  }
}

export async function createDatabaseBackup(options: { trigger: 'manual' | 'scheduled'; userId?: string }) {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `

  const tableData: Record<string, unknown[]> = {}
  for (const table of tables) {
    const name = table.tablename
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) continue
    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${name}"`)
    tableData[name] = (Array.isArray(rows) ? rows : []).map(row => serializeValue(row) as Record<string, unknown>) as unknown[]
  }

  const payload = {
    format: 'sirtis-logical-backup',
    version: 1,
    generatedAt: new Date().toISOString(),
    trigger: options.trigger,
    tableCount: Object.keys(tableData).length,
    tables: tableData,
  }
  const fileBuffer = Buffer.from(JSON.stringify(payload), 'utf8')
  const id = randomUUID()
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `sirtis-db-backup-${stamp}-${options.trigger}.json`
  const storagePath = `database-backups/${filename}`

  const upload = await uploadToSupabaseStorage({
    bucket: BUCKET,
    path: storagePath,
    file: fileBuffer,
    contentType: 'application/json',
    upsert: false,
  })

  if (!upload.success) {
    throw new Error(upload.error || 'Failed to store the backup in the documents container')
  }

  await prisma.documents.create({
    data: {
      id,
      filename,
      originalName: filename,
      mimeType: 'application/json',
      size: fileBuffer.length,
      path: storagePath,
      url: upload.signedUrl || upload.publicUrl || null,
      category: 'ARCHIVE',
      description: options.trigger === 'scheduled'
        ? 'Scheduled database backup'
        : 'Manual database backup',
      tags: [DATABASE_BACKUP_TAG, options.trigger],
      classification: 'RESTRICTED',
      accessLevel: 'admin',
      isPublic: false,
      isPersonalRepo: false,
      uploadedBy: options.userId || 'system',
      folderPath: 'database-backups',
      approvalStatus: 'APPROVED',
      reviewStatus: 'APPROVED',
      customMetadata: {
        kind: DATABASE_BACKUP_TAG,
        trigger: options.trigger,
        storageBucket: BUCKET,
        storagePath,
        tableCount: Object.keys(tableData).length,
        status: 'completed',
      },
      updatedAt: new Date(),
    },
  })

  const schedule = await getBackupSchedule()
  await applyRetention(schedule.retentionCount)

  return {
    id,
    filename,
    size: formatBackupBytes(fileBuffer.length),
    sizeBytes: fileBuffer.length,
    tableCount: Object.keys(tableData).length,
    trigger: options.trigger,
  }
}

export function lastScheduledSlot(schedule: BackupSchedule, now = new Date()) {
  const slot = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    RUN_HOUR_UTC,
    0,
    0,
    0
  ))
  if (schedule.frequency === 'daily') {
    if (now.getTime() < slot.getTime()) slot.setUTCDate(slot.getUTCDate() - 1)
    return slot
  }
  const daysBack = (slot.getUTCDay() - schedule.weekday + 7) % 7
  slot.setUTCDate(slot.getUTCDate() - daysBack)
  if (now.getTime() < slot.getTime()) slot.setUTCDate(slot.getUTCDate() - 7)
  return slot
}

export async function latestScheduledBackupAt() {
  const row = await prisma.documents.findFirst({
    where: {
      isDeleted: false,
      AND: [
        { tags: { has: DATABASE_BACKUP_TAG } },
        { tags: { has: 'scheduled' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  return row?.createdAt ?? null
}

export async function scheduledBackupIsDue(schedule: BackupSchedule, now = new Date()) {
  if (!schedule.enabled) return false
  if (schedule.lastAttemptAt) {
    const attempt = new Date(schedule.lastAttemptAt).getTime()
    const success = schedule.lastSuccessAt ? new Date(schedule.lastSuccessAt).getTime() : 0
    if (Number.isFinite(attempt) && attempt > success && now.getTime() - attempt < 20 * 60 * 1000) {
      return false
    }
  }
  const slot = lastScheduledSlot(schedule, now)
  if (now.getTime() < slot.getTime()) return false
  const last = await latestScheduledBackupAt()
  return !last || last.getTime() < slot.getTime()
}

export async function runScheduledBackupIfDue() {
  const schedule = await getBackupSchedule()
  if (!(await scheduledBackupIsDue(schedule))) {
    return { ran: false as const, schedule }
  }
  await writeScheduleState({ lastAttemptAt: new Date().toISOString(), lastError: null })
  try {
    const backup = await createDatabaseBackup({ trigger: 'scheduled', userId: 'system' })
    await recordBackupAttempt({ ok: true })
    return { ran: true as const, backup }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scheduled backup failed'
    await recordBackupAttempt({ ok: false, error: message })
    throw error
  }
}
