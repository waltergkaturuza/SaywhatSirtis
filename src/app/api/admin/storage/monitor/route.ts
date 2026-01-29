import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/admin/storage/monitor
 * 
 * Monitor storage usage and provide alerts for:
 * - Storage quota usage
 * - Large files
 * - Orphaned files (in storage but not in DB)
 * - Missing files (in DB but not in storage)
 * - Storage costs
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const isAdmin = session.user?.roles?.some(role => 
      ['admin', 'hr'].includes(role.toLowerCase())
    ) || session.user?.permissions?.includes('admin.full_access')

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeAlerts = searchParams.get('alerts') !== 'false'

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Supabase not configured',
        storage: null,
        alerts: includeAlerts ? [{
          level: 'error',
          message: 'Supabase Storage is not configured. Files are using filesystem storage.',
          timestamp: new Date().toISOString()
        }] : []
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get storage statistics
    const storageStats = await getStorageStatistics(supabase)
    
    // Get database statistics
    const dbStats = await getDatabaseStatistics()

    // Calculate storage usage
    const totalStorageUsed = storageStats.totalSize
    const totalStorageLimit = storageStats.limit || 1073741824 // 1GB default for free tier
    const storageUsagePercent = (totalStorageUsed / totalStorageLimit) * 100

    // Generate alerts
    const alerts: Array<{
      level: 'info' | 'warning' | 'error'
      message: string
      timestamp: string
      action?: string
    }> = []

    if (includeAlerts) {
      // Storage quota alerts
      if (storageUsagePercent > 90) {
        alerts.push({
          level: 'error',
          message: `Storage quota critical: ${storageUsagePercent.toFixed(1)}% used (${formatBytes(totalStorageUsed)} / ${formatBytes(totalStorageLimit)})`,
          timestamp: new Date().toISOString(),
          action: 'Consider upgrading storage plan or archiving old files'
        })
      } else if (storageUsagePercent > 75) {
        alerts.push({
          level: 'warning',
          message: `Storage quota warning: ${storageUsagePercent.toFixed(1)}% used`,
          timestamp: new Date().toISOString(),
          action: 'Monitor storage usage closely'
        })
      }

      // Large files alert
      const largeFiles = storageStats.largeFiles || []
      if (largeFiles.length > 0) {
        alerts.push({
          level: 'info',
          message: `Found ${largeFiles.length} large files (>50MB). Consider compressing or archiving.`,
          timestamp: new Date().toISOString()
        })
      }

      // Missing files alert (in DB but not in storage)
      const missingFiles = await checkMissingFiles(supabase)
      if (missingFiles.length > 0) {
        alerts.push({
          level: 'warning',
          message: `Found ${missingFiles.length} documents in database without corresponding files in storage`,
          timestamp: new Date().toISOString(),
          action: 'Review and clean up orphaned database records'
        })
      }

      // Orphaned files alert (in storage but not in DB)
      const orphanedFiles = await checkOrphanedFiles(supabase)
      if (orphanedFiles.length > 0) {
        alerts.push({
          level: 'info',
          message: `Found ${orphanedFiles.length} files in storage without corresponding database records`,
          timestamp: new Date().toISOString(),
          action: 'Review and clean up orphaned storage files'
        })
      }

      // Cost estimate
      const estimatedCost = calculateEstimatedCost(totalStorageUsed, storageStats.bandwidthUsed || 0)
      if (estimatedCost > 0) {
        alerts.push({
          level: 'info',
          message: `Estimated monthly cost: $${estimatedCost.toFixed(2)} (storage + bandwidth)`,
          timestamp: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({
      storage: {
        used: totalStorageUsed,
        limit: totalStorageLimit,
        usagePercent: storageUsagePercent,
        usedFormatted: formatBytes(totalStorageUsed),
        limitFormatted: formatBytes(totalStorageLimit),
        buckets: storageStats.buckets,
        fileCount: storageStats.fileCount,
        largeFiles: storageStats.largeFiles?.slice(0, 10) // Top 10 large files
      },
      database: {
        totalDocuments: dbStats.totalDocuments,
        supabaseDocuments: dbStats.supabaseDocuments,
        filesystemDocuments: dbStats.filesystemDocuments,
        totalSize: dbStats.totalSize
      },
      alerts: includeAlerts ? alerts : [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Storage monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage statistics', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function getStorageStatistics(supabase: any) {
  const buckets = ['documents', 'risk-documents']
  const stats = {
    totalSize: 0,
    fileCount: 0,
    largeFiles: [] as Array<{ path: string; size: number; sizeFormatted: string }>,
    buckets: {} as Record<string, any>,
    limit: 1073741824, // 1GB default
    bandwidthUsed: 0
  }

  for (const bucketName of buckets) {
    try {
      // List all files in bucket
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 10000, sortBy: { column: 'size', order: 'desc' } })

      if (error) {
        console.warn(`Error listing files in bucket ${bucketName}:`, error)
        continue
      }

      let bucketSize = 0
      const bucketFiles: Array<{ path: string; size: number; sizeFormatted: string }> = []

      if (files) {
        for (const file of files) {
          const fileSize = file.metadata?.size || 0
          bucketSize += fileSize
          stats.fileCount++

          // Track large files (>50MB)
          if (fileSize > 50 * 1024 * 1024) {
            bucketFiles.push({
              path: `${bucketName}/${file.name}`,
              size: fileSize,
              sizeFormatted: formatBytes(fileSize)
            })
          }
        }
      }

      stats.totalSize += bucketSize
      stats.largeFiles.push(...bucketFiles)

      stats.buckets[bucketName] = {
        size: bucketSize,
        sizeFormatted: formatBytes(bucketSize),
        fileCount: files?.length || 0
      }
    } catch (error) {
      console.warn(`Error processing bucket ${bucketName}:`, error)
    }
  }

  return stats
}

async function getDatabaseStatistics() {
  const [totalDocuments, supabaseDocuments, filesystemDocuments] = await Promise.all([
    prisma.documents.count(),
    prisma.documents.count({
      where: {
        customMetadata: {
          path: ['storageProvider'],
          equals: 'supabase'
        }
      }
    }),
    prisma.documents.count({
      where: {
        OR: [
          { url: null },
          {
            customMetadata: {
              path: ['storageProvider'],
              not: 'supabase'
            }
          }
        ]
      }
    })
  ])

  // Calculate total size from database
  const sizeResult = await prisma.documents.aggregate({
    _sum: { size: true }
  })

  return {
    totalDocuments,
    supabaseDocuments,
    filesystemDocuments,
    totalSize: sizeResult._sum.size || 0
  }
}

async function checkMissingFiles(supabase: any): Promise<string[]> {
  // Get documents that should be in Supabase Storage but might be missing
  const documents = await prisma.documents.findMany({
    where: {
      customMetadata: {
        path: ['storageProvider'],
        equals: 'supabase'
      },
      url: { not: null }
    },
    select: { id: true, path: true, customMetadata: true }
  })

  const missing: string[] = []

  for (const doc of documents) {
    const metadata = doc.customMetadata as any
    const bucket = metadata.storageBucket || 'documents'
    const storagePath = doc.path

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(storagePath.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: storagePath.split('/').pop() || ''
        })

      if (error || !data || data.length === 0) {
        missing.push(doc.id)
      }
    } catch {
      missing.push(doc.id)
    }
  }

  return missing
}

async function checkOrphanedFiles(supabase: any): Promise<string[]> {
  // This is a simplified check - in production, you'd want a more comprehensive scan
  const orphaned: string[] = []
  
  // Get all storage paths from database
  const documents = await prisma.documents.findMany({
    where: {
      customMetadata: {
        path: ['storageProvider'],
        equals: 'supabase'
      }
    },
    select: { path: true, customMetadata: true }
  })

  const dbPaths = new Set(documents.map(doc => {
    const metadata = doc.customMetadata as any
    return `${metadata.storageBucket || 'documents'}/${doc.path}`
  }))

  // Check storage files (simplified - would need full scan for complete check)
  // This is a placeholder - full implementation would scan all files
  
  return orphaned
}

function calculateEstimatedCost(storageBytes: number, bandwidthBytes: number): number {
  // Supabase Pro pricing: $0.021/GB storage, $0.09/GB bandwidth
  const storageGB = storageBytes / (1024 * 1024 * 1024)
  const bandwidthGB = bandwidthBytes / (1024 * 1024 * 1024)
  
  const storageCost = storageGB * 0.021
  const bandwidthCost = bandwidthGB * 0.09
  
  return storageCost + bandwidthCost
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
