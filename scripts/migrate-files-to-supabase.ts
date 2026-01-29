#!/usr/bin/env tsx
/**
 * Migration Script: Migrate Filesystem Files to Supabase Storage
 * 
 * This script migrates existing documents from filesystem storage to Supabase Storage.
 * It reads files from the filesystem, uploads them to Supabase Storage, and updates
 * the database records with the new storage URLs.
 * 
 * Usage:
 *   npx tsx scripts/migrate-files-to-supabase.ts [options]
 * 
 * Options:
 *   --dry-run          Run without making changes (preview only)
 *   --limit=N         Limit migration to N documents (default: all)
 *   --batch-size=N     Process N documents at a time (default: 10)
 *   --skip-existing    Skip documents already in Supabase Storage
 *   --project-id=ID    Migrate only documents for a specific project
 */

import { PrismaClient } from '@prisma/client'
import { uploadToSupabaseStorage, ensureBucketExists } from '../src/lib/storage/supabase-storage'
import { readFile, access, constants } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

interface MigrationStats {
  total: number
  migrated: number
  skipped: number
  failed: number
  errors: Array<{ documentId: string; error: string }>
}

interface MigrationOptions {
  dryRun: boolean
  limit?: number
  batchSize: number
  skipExisting: boolean
  projectId?: string
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function migrateDocument(
  document: any,
  options: MigrationOptions
): Promise<{ success: boolean; error?: string }> {
  const metadata = document.customMetadata as any || {}
  
  // Skip if already migrated (unless --skip-existing is false)
  if (options.skipExisting && metadata.storageProvider === 'supabase') {
    return { success: true } // Already migrated
  }

  // Skip if no path
  if (!document.path) {
    return { success: false, error: 'No path specified' }
  }

  // Determine file path
  let filePath: string
  if (document.path.startsWith('uploads/') || document.path.startsWith('/uploads/')) {
    filePath = path.join(process.cwd(), 'public', document.path.replace(/^\/+/, ''))
  } else if (document.path.startsWith('public/')) {
    filePath = path.join(process.cwd(), document.path)
  } else {
    filePath = path.join(process.cwd(), 'public', 'uploads', document.path)
  }

  // Check if file exists
  const fileExists = await checkFileExists(filePath)
  if (!fileExists) {
    return { success: false, error: `File not found: ${filePath}` }
  }

  if (options.dryRun) {
    console.log(`[DRY RUN] Would migrate: ${document.id} - ${document.originalName}`)
    return { success: true }
  }

  try {
    // Read file from filesystem
    const fileBuffer = await readFile(filePath)
    
    // Determine bucket based on document type
    let bucket = 'documents'
    if (document.path.includes('risk-documents')) {
      bucket = 'risk-documents'
    }

    // Ensure bucket exists
    await ensureBucketExists(bucket)

    // Use existing folderPath or path for storage path
    const storagePath = document.folderPath || document.path.replace(/^uploads\//, '')

    // Upload to Supabase Storage
    const uploadResult = await uploadToSupabaseStorage({
      bucket,
      path: storagePath,
      file: fileBuffer,
      contentType: document.mimeType || 'application/octet-stream',
      upsert: true // Allow overwriting if file already exists
    })

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error || 'Upload failed' }
    }

    // Update database record
    await prisma.documents.update({
      where: { id: document.id },
      data: {
        url: uploadResult.url || uploadResult.publicUrl,
        customMetadata: {
          ...metadata,
          storageProvider: 'supabase',
          storageBucket: bucket,
          migratedAt: new Date().toISOString(),
          originalPath: document.path // Keep original path for reference
        }
      }
    })

    console.log(`✅ Migrated: ${document.id} - ${document.originalName}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Failed to migrate ${document.id}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

async function migrateDocuments(options: MigrationOptions): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  }

  try {
    // Build query
    const where: any = {
      // Only migrate filesystem-stored documents
      OR: [
        { url: null },
        { url: { equals: '' } },
        {
          customMetadata: {
            path: ['storageProvider'],
            not: 'supabase'
          }
        }
      ]
    }

    // Filter by project if specified
    if (options.projectId) {
      where.projectId = options.projectId
    }

    // Count total documents to migrate
    stats.total = await prisma.documents.count({ where })

    console.log(`\n📊 Found ${stats.total} documents to migrate`)

    if (options.limit) {
      console.log(`📌 Limiting to ${options.limit} documents`)
    }

    if (options.dryRun) {
      console.log(`🔍 DRY RUN MODE - No changes will be made\n`)
    }

    // Fetch documents in batches
    let processed = 0
    let skip = 0

    while (processed < stats.total && (!options.limit || processed < options.limit)) {
      const documents = await prisma.documents.findMany({
        where,
        take: options.batchSize,
        skip,
        orderBy: { createdAt: 'asc' }
      })

      if (documents.length === 0) break

      // Process batch
      for (const document of documents) {
        if (options.limit && processed >= options.limit) break

        const result = await migrateDocument(document, options)

        if (result.success) {
          if (options.dryRun || (document.customMetadata as any)?.storageProvider === 'supabase') {
            stats.skipped++
          } else {
            stats.migrated++
          }
        } else {
          stats.failed++
          stats.errors.push({
            documentId: document.id,
            error: result.error || 'Unknown error'
          })
        }

        processed++

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      skip += documents.length
      console.log(`\n📈 Progress: ${processed}/${stats.total} (${Math.round((processed / stats.total) * 100)}%)`)
    }

    return stats
  } catch (error) {
    console.error('❌ Migration error:', error)
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  const options: MigrationOptions = {
    dryRun: args.includes('--dry-run'),
    limit: args.find(arg => arg.startsWith('--limit='))?.split('=')[1] 
      ? parseInt(args.find(arg => arg.startsWith('--limit='))!.split('=')[1]) 
      : undefined,
    batchSize: args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]
      ? parseInt(args.find(arg => arg.startsWith('--batch-size='))!.split('=')[1])
      : 10,
    skipExisting: args.includes('--skip-existing'),
    projectId: args.find(arg => arg.startsWith('--project-id='))?.split('=')[1]
  }

  console.log('🚀 Starting File Migration to Supabase Storage')
  console.log('=' .repeat(60))
  console.log('Options:', JSON.stringify(options, null, 2))
  console.log('=' .repeat(60))

  // Check Supabase configuration
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  try {
    const stats = await migrateDocuments(options)

    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Summary')
    console.log('='.repeat(60))
    console.log(`Total documents:     ${stats.total}`)
    console.log(`✅ Migrated:         ${stats.migrated}`)
    console.log(`⏭️  Skipped:          ${stats.skipped}`)
    console.log(`❌ Failed:           ${stats.failed}`)

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:')
      stats.errors.slice(0, 10).forEach(({ documentId, error }) => {
        console.log(`  - ${documentId}: ${error}`)
      })
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more`)
      }
    }

    if (options.dryRun) {
      console.log('\n⚠️  This was a DRY RUN - No changes were made')
      console.log('Run without --dry-run to perform actual migration')
    } else {
      console.log('\n✅ Migration completed!')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { migrateDocuments, migrateDocument }
