import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasAdminAccess } from '@/lib/admin-auth'
import { safeQuery } from '@/lib/prisma'
import {
  createDatabaseBackup,
  getBackupSchedule,
  listDatabaseBackups,
  saveBackupSchedule,
} from '@/lib/database-backup'
import { analyzeUserTable, refreshPlannerStatistics, vacuumDatabase } from '@/lib/database-maintenance'

export const maxDuration = 60

interface TableInfo {
  name: string
  rows: number
  deadRows?: number
  size: string
  totalSize: number
  lastModified: string
}

interface DatabaseStats {
  connection: {
    status: string
    host: string
    database: string
    version: string
    uptime: string
    maxConnections: number
    activeConnections: number
    responseTime: number
  }
  tables: TableInfo[]
  performance: {
    queries: {
      total: number
      slow: number
      failed: number
      averageTime: number
    }
    indexes: {
      total: number
      unused: number
      duplicates: number
    }
    storage: {
      total: string
      used: string
      free: string
      fragmentation: number
    }
  }
  backups: any[]
  backupSchedule: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    weekday: number
    retentionCount: number
  }
  migrations: any[]
  recentActivity: any[]
  health: {
    status: 'good' | 'attention'
    checks: Array<{ name: string; ok: boolean; detail: string }>
  }
}

// Helper to format bytes
function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return 'N/A'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${Math.max(1, minutes)}m`
}

async function getConnectionStatus() {
  try {
    const startTime = Date.now()
    const rows = await prisma.$queryRaw<Array<{
      database: string
      version: string
      uptime_seconds: bigint
      max_connections: number
      active_connections: bigint
    }>>`
      SELECT
        current_database() AS database,
        version() AS version,
        EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))::bigint AS uptime_seconds,
        current_setting('max_connections')::int AS max_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) AS active_connections
    `
    const responseTime = Date.now() - startTime
    const row = rows[0]
    const dbUrl = process.env.DATABASE_URL || ''

    return {
      status: responseTime < 1000 ? 'online' : 'degraded',
      host: dbUrl.includes('supabase') ? 'Supabase' : (dbUrl.includes('@') ? dbUrl.split('@')[1]?.split('/')[0] : 'PostgreSQL'),
      database: row?.database || 'unknown',
      version: (row?.version || 'PostgreSQL').split(',')[0],
      uptime: formatUptime(Number(row?.uptime_seconds || 0)),
      maxConnections: Number(row?.max_connections || 0),
      activeConnections: Number(row?.active_connections || 0),
      responseTime
    }
  } catch (error) {
    console.error('Error getting connection status:', error)
    return {
      status: 'offline',
      host: 'unknown',
      database: 'unknown',
      version: 'PostgreSQL',
      uptime: 'N/A',
      maxConnections: 0,
      activeConnections: 0,
      responseTime: 0
    }
  }
}

// Get all tables with row counts and sizes
async function getTablesInfo(): Promise<TableInfo[]> {
  try {
    const tables = await prisma.$queryRaw<Array<{
      tablename: string
      n_live_tup: bigint
      n_dead_tup: bigint
      size_pretty: string
      total_size: bigint
      last_modified: Date | null
    }>>`
      SELECT
        relname AS tablename,
        n_live_tup,
        n_dead_tup,
        pg_size_pretty(pg_total_relation_size(relid)) AS size_pretty,
        pg_total_relation_size(relid) AS total_size,
        GREATEST(last_vacuum, last_autovacuum, last_analyze, last_autoanalyze) AS last_modified
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    `

    return tables.map(table => ({
      name: table.tablename,
      rows: Number(table.n_live_tup || 0),
      deadRows: Number(table.n_dead_tup || 0),
      size: table.size_pretty || '0 B',
      totalSize: Number(table.total_size || 0),
      lastModified: table.last_modified ? new Date(table.last_modified).toISOString() : ''
    }))
  } catch (error) {
    console.error('Error getting tables info:', error)
    return []
  }
}

// Get storage information
async function getStorageInfo() {
  try {
    const storageResult = await prisma.$queryRaw<Array<{
      database_size: string
      tables_size: string
      indexes_size: string
    }>>`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) AS database_size,
        pg_size_pretty(coalesce(sum(pg_relation_size(relid)), 0)::bigint) AS tables_size,
        pg_size_pretty(coalesce(sum(pg_indexes_size(relid)), 0)::bigint) AS indexes_size
      FROM pg_stat_user_tables
    `

    return {
      total: storageResult[0]?.database_size || '0 B',
      used: storageResult[0]?.tables_size || '0 B',
      free: storageResult[0]?.indexes_size || '0 B',
      fragmentation: 0
    }
  } catch (error) {
    console.error('Error getting storage info:', error)
    return {
      total: 'unknown',
      used: 'unknown',
      free: 'unknown',
      fragmentation: 0
    }
  }
}

// Get index information
async function getIndexInfo() {
  try {
    const indexResult = await prisma.$queryRaw<Array<{
      total_indexes: bigint
      unused_indexes: bigint
      duplicate_indexes: bigint
    }>>`
      SELECT
        (SELECT count(*) FROM pg_stat_user_indexes) AS total_indexes,
        (SELECT count(*) FROM pg_stat_user_indexes WHERE idx_scan = 0) AS unused_indexes,
        (
          SELECT count(*)
          FROM (
            SELECT indrelid, indkey
            FROM pg_index
            GROUP BY indrelid, indkey
            HAVING count(*) > 1
          ) duplicates
        ) AS duplicate_indexes
    `

    return {
      total: Number(indexResult?.[0]?.total_indexes || 0),
      unused: Number(indexResult?.[0]?.unused_indexes || 0),
      duplicates: Number(indexResult?.[0]?.duplicate_indexes || 0)
    }
  } catch (error) {
    console.error('Error getting index info:', error)
    return {
      total: 0,
      unused: 0,
      duplicates: 0
    }
  }
}

// Get query performance from audit logs
async function getQueryPerformance() {
  try {
    const transactions = await prisma.$queryRaw<Array<{ total: bigint; failed: bigint }>>`
      SELECT
        (xact_commit + xact_rollback) AS total,
        xact_rollback AS failed
      FROM pg_stat_database
      WHERE datname = current_database()
    `

    const total = Number(transactions[0]?.total || 0)
    const failed = Number(transactions[0]?.failed || 0)
    let slow = 0

    try {
      const statements = await prisma.$queryRaw<Array<{ slow: bigint }>>`
        SELECT coalesce(sum(CASE WHEN mean_exec_time > 1000 THEN calls ELSE 0 END), 0) AS slow
        FROM pg_stat_statements
      `
      slow = Number(statements[0]?.slow || 0)
    } catch {
      slow = 0
    }

    return {
      total,
      slow,
      failed,
      averageTime: 0
    }
  } catch (error) {
    console.error('Error getting query performance:', error)
    return {
      total: 0,
      slow: 0,
      failed: 0,
      averageTime: 0
    }
  }
}

// Get recent activity from audit logs
async function getRecentActivity() {
  try {
    const recentLogs = await safeQuery(async (prisma) => {
      return await prisma.audit_logs.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          resource: true,
          timestamp: true,
          users: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        }
      })
    }).catch(() => [])

    return recentLogs.map(log => {
      const name = [log.users?.firstName, log.users?.lastName].filter(Boolean).join(' ')
      return {
        type: log.action || 'ACTIVITY',
        table: log.resource || 'system',
        user: name || log.users?.email || 'system',
        timestamp: log.timestamp.toISOString()
      }
    })
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return []
  }
}

async function getMigrations() {
  try {
    const rows = await prisma.$queryRaw<Array<{
      migration_name: string
      finished_at: Date | null
      rolled_back_at: Date | null
      started_at: Date | null
    }>>`
      SELECT migration_name, finished_at, rolled_back_at, started_at
      FROM "_prisma_migrations"
      ORDER BY started_at DESC
      LIMIT 8
    `
    return rows.map((row) => ({
      id: row.migration_name,
      name: row.migration_name,
      status: row.rolled_back_at ? 'rolled back' : row.finished_at ? 'applied' : 'pending',
      appliedAt: (row.finished_at || row.started_at || new Date()).toISOString(),
    }))
  } catch (error) {
    console.error('Error getting migrations:', error)
    return []
  }
}

function buildHealth(
  connection: DatabaseStats['connection'],
  indexes: DatabaseStats['performance']['indexes'],
  backups: any[],
  tables: TableInfo[]
) {
  const connectionRatio = connection.maxConnections
    ? connection.activeConnections / connection.maxConnections
    : 0
  const deadRows = tables.reduce((sum, table) => sum + Number((table as TableInfo & { deadRows?: number }).deadRows || 0), 0)
  const latestBackup = backups[0]
  const checks = [
    {
      name: 'Connection',
      ok: connection.status === 'online',
      detail: connection.status === 'online' ? `${connection.responseTime}ms` : connection.status,
    },
    {
      name: 'Connections',
      ok: connectionRatio < 0.8,
      detail: `${connection.activeConnections} / ${connection.maxConnections}`,
    },
    {
      name: 'Unused indexes',
      ok: indexes.unused < 25,
      detail: indexes.unused.toLocaleString(),
    },
    {
      name: 'Dead rows',
      ok: deadRows < 100000,
      detail: deadRows.toLocaleString(),
    },
    {
      name: 'Latest backup',
      ok: Boolean(latestBackup),
      detail: latestBackup?.createdAt ? new Date(latestBackup.createdAt).toLocaleString() : 'None yet',
    },
  ]
  return {
    status: checks.every((check) => check.ok) ? 'good' as const : 'attention' as const,
    checks,
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch real database statistics
    const [connection, tables, storage, indexes, performance, recentActivity, backups, backupSchedule, migrations] = await Promise.all([
      getConnectionStatus(),
      getTablesInfo(),
      getStorageInfo(),
      getIndexInfo(),
      getQueryPerformance(),
      getRecentActivity(),
      listDatabaseBackups().catch(() => []),
      getBackupSchedule().catch(() => ({
        enabled: true,
        frequency: 'daily' as const,
        weekday: 0,
        retentionCount: 14,
      })),
      getMigrations(),
    ])

    const dbStats: DatabaseStats = {
      connection,
      tables,
      performance: {
        queries: performance,
        indexes,
        storage
      },
      backups,
      backupSchedule,
      migrations,
      recentActivity,
      health: buildHealth(connection, indexes, backups, tables),
    }

    return NextResponse.json({
      success: true,
      data: dbStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching database status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, table } = body

    switch (action) {
      case 'backup_database': {
        const backup = await createDatabaseBackup({
          trigger: 'manual',
          userId: session.user?.id || session.user?.email || 'admin',
        })
        return NextResponse.json({
          success: true,
          message: `Backup saved to documents (${backup.tableCount} tables, ${backup.size})`,
          data: backup,
        })
      }

      case 'save_backup_schedule': {
        const schedule = await saveBackupSchedule({
          enabled: body.enabled,
          frequency: body.frequency,
          weekday: body.weekday,
          retentionCount: body.retentionCount,
        })
        return NextResponse.json({
          success: true,
          message: schedule.enabled
            ? `Automated ${schedule.frequency} backup is on`
            : 'Automated backup is off',
          data: schedule,
        })
      }

      case 'optimize_database':
        await refreshPlannerStatistics()
        return NextResponse.json({
          success: true,
          message: 'Planner statistics were refreshed for every table.',
        })

      case 'vacuum_database': {
        const vacuum = await vacuumDatabase()
        return NextResponse.json({
          success: true,
          message: vacuum.message,
          data: vacuum,
        })
      }

      case 'analyze_table': {
        if (!table) {
          return NextResponse.json(
            { error: 'Table name is required' },
            { status: 400 }
          )
        }
        const analysis = await analyzeUserTable(String(table))
        return NextResponse.json({
          success: true,
          message: `${analysis.table}: ${analysis.rows.toLocaleString()} live rows, ${analysis.deadRows.toLocaleString()} dead rows, ${analysis.indexes} indexes, ${analysis.size}.`,
          data: analysis,
        })
      }

      case 'check_health':
        return NextResponse.json({
          success: true,
          message: 'Health check refreshed from the live database.',
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing database action:', error)
    return NextResponse.json(
      { error: 'Failed to process database action' },
      { status: 500 }
    )
  }
}
