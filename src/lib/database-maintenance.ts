import { prisma } from '@/lib/prisma'

const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/
const EXPORT_LIMIT = 50000

export async function resolveUserTable(name: string): Promise<string> {
  if (!TABLE_NAME.test(name)) {
    throw new Error('Invalid table name')
  }

  const rows = await prisma.$queryRaw<Array<{ relname: string }>>`
    SELECT relname
    FROM pg_stat_user_tables
    WHERE relname = ${name}
    LIMIT 1
  `
  const found = rows[0]?.relname
  if (!found) {
    throw new Error('Table not found')
  }
  return found
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value.toString('base64')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function csvCell(value: unknown): string {
  let text = cellText(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export async function exportUserTableCsv(name: string): Promise<{ filename: string; csv: string; rowCount: number; truncated: boolean }> {
  const table = await resolveUserTable(name)
  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position
  `
  const headers = columns.map((column) => column.column_name)
  const quoted = `"${table.replace(/"/g, '""')}"`
  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT * FROM ${quoted} LIMIT ${EXPORT_LIMIT + 1}`
  )
  const truncated = rows.length > EXPORT_LIMIT
  const data = truncated ? rows.slice(0, EXPORT_LIMIT) : rows
  const lines = [
    headers.map((header) => csvCell(header)).join(','),
    ...data.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ]

  return {
    filename: `${table}.csv`,
    csv: `\uFEFF${lines.join('\n')}`,
    rowCount: data.length,
    truncated,
  }
}

export async function analyzeUserTable(name: string) {
  const table = await resolveUserTable(name)
  await prisma.$executeRawUnsafe(`ANALYZE "${table.replace(/"/g, '""')}"`)

  const stats = await prisma.$queryRaw<Array<{ rows: bigint; dead_rows: bigint; size: string; indexes: bigint }>>`
    SELECT
      s.n_live_tup AS rows,
      s.n_dead_tup AS dead_rows,
      pg_size_pretty(pg_total_relation_size(s.relid)) AS size,
      (
        SELECT count(*)
        FROM pg_indexes i
        WHERE i.schemaname = 'public' AND i.tablename = s.relname
      ) AS indexes
    FROM pg_stat_user_tables s
    WHERE s.relname = ${table}
  `

  const row = stats[0]
  return {
    table,
    rows: Number(row?.rows || 0),
    deadRows: Number(row?.dead_rows || 0),
    size: row?.size || '0 B',
    indexes: Number(row?.indexes || 0),
  }
}

export async function refreshPlannerStatistics() {
  await prisma.$executeRawUnsafe('ANALYZE')
}

export async function vacuumDatabase() {
  try {
    await prisma.$executeRawUnsafe('VACUUM (ANALYZE)')
    return {
      vacuumed: true,
      message: 'Vacuum completed and planner statistics were refreshed.',
    }
  } catch (error) {
    await prisma.$executeRawUnsafe('ANALYZE')
    console.error('VACUUM was blocked by the database host:', error)
    return {
      vacuumed: false,
      message: 'Planner statistics were refreshed. This database host does not allow VACUUM from the application connection.',
    }
  }
}
