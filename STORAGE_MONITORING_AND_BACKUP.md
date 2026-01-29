# 📊 Storage Monitoring & Backup Strategy

## Overview

This document describes the monitoring, alerting, and backup strategies for SIRTIS document storage in Supabase Storage.

## Monitoring

### Storage Usage Monitoring

The system provides real-time monitoring of storage usage through the API endpoint:

**Endpoint**: `GET /api/admin/storage/monitor`

**Features**:
- Storage quota usage tracking
- Large file detection (>50MB)
- Missing files detection (in DB but not in storage)
- Orphaned files detection (in storage but not in DB)
- Cost estimation
- Alert generation

### Access

Only users with admin or HR roles can access monitoring endpoints.

### Example Usage

```bash
# Get storage statistics and alerts
curl -X GET "https://your-domain.com/api/admin/storage/monitor" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get statistics without alerts
curl -X GET "https://your-domain.com/api/admin/storage/monitor?alerts=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response Format

```json
{
  "storage": {
    "used": 524288000,
    "limit": 1073741824,
    "usagePercent": 48.8,
    "usedFormatted": "500 MB",
    "limitFormatted": "1 GB",
    "buckets": {
      "documents": {
        "size": 400000000,
        "sizeFormatted": "381.47 MB",
        "fileCount": 150
      },
      "risk-documents": {
        "size": 124288000,
        "sizeFormatted": "118.59 MB",
        "fileCount": 45
      }
    },
    "fileCount": 195,
    "largeFiles": [
      {
        "path": "documents/2026/MEALS-Project/video_report.mp4",
        "size": 52428800,
        "sizeFormatted": "50 MB"
      }
    ]
  },
  "database": {
    "totalDocuments": 200,
    "supabaseDocuments": 195,
    "filesystemDocuments": 5,
    "totalSize": 524288000
  },
  "alerts": [
    {
      "level": "warning",
      "message": "Storage quota warning: 48.8% used",
      "timestamp": "2026-01-29T10:00:00Z",
      "action": "Monitor storage usage closely"
    }
  ],
  "timestamp": "2026-01-29T10:00:00Z"
}
```

### Alert Levels

- **info**: Informational messages (large files, cost estimates)
- **warning**: Warnings that need attention (75-90% quota usage, missing files)
- **error**: Critical issues (90%+ quota usage, system errors)

### Alert Thresholds

- **Storage Quota**:
  - Warning: >75% usage
  - Error: >90% usage

- **Large Files**: >50MB (informational)

- **Missing Files**: Documents in database without corresponding storage files

- **Orphaned Files**: Files in storage without corresponding database records

## Backup Strategy

### Backup Endpoints

#### 1. Generate Backup Manifest

**Endpoint**: `POST /api/admin/storage/backup`

**Body**:
```json
{
  "format": "json",  // or "csv"
  "includeFiles": false  // Include file contents (not recommended for large backups)
}
```

**Response**: Downloadable backup file (JSON or CSV)

#### 2. Get Backup Information

**Endpoint**: `GET /api/admin/storage/backup`

**Response**: Backup statistics and recommendations

### Backup Manifest Format

The backup manifest includes:

- Document metadata (ID, filename, path, URL, size, etc.)
- Storage provider information
- Timestamps (created, updated)
- Project associations
- Version information

### Backup Recommendations

1. **Frequency**: Weekly backups recommended
2. **Storage Location**: Store backups in separate location (not in Supabase Storage)
3. **Retention**: Keep backups for at least 90 days
4. **Testing**: Test backup restoration quarterly
5. **Automation**: Consider automated backup solutions

### Manual Backup Process

1. **Generate Backup**:
   ```bash
   curl -X POST "https://your-domain.com/api/admin/storage/backup" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"format": "json"}' \
     -o backup-$(date +%Y%m%d).json
   ```

2. **Store Backup**: Upload to secure backup location (AWS S3, Google Cloud Storage, etc.)

3. **Verify Backup**: Check backup file integrity

4. **Document**: Record backup date and location

### Automated Backup Script

Create a cron job or scheduled task:

```bash
#!/bin/bash
# backup-storage.sh

BACKUP_DIR="/backups/sirtis"
DATE=$(date +%Y%m%d)
TOKEN="YOUR_ADMIN_TOKEN"
API_URL="https://your-domain.com/api/admin/storage/backup"

# Generate backup
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format": "json"}' \
  -o "$BACKUP_DIR/storage-backup-$DATE.json"

# Compress backup
gzip "$BACKUP_DIR/storage-backup-$DATE.json"

# Upload to cloud storage (example: AWS S3)
aws s3 cp "$BACKUP_DIR/storage-backup-$DATE.json.gz" \
  s3://your-backup-bucket/sirtis/storage/

# Clean up old backups (keep last 90 days)
find "$BACKUP_DIR" -name "storage-backup-*.json.gz" -mtime +90 -delete

echo "Backup completed: storage-backup-$DATE.json.gz"
```

### Restore Process

1. **Download Backup**: Retrieve backup file from backup location

2. **Verify Backup**: Check backup file integrity

3. **Restore Metadata**: Import document metadata to database

4. **Restore Files**: 
   - If files are in Supabase Storage, they should still be accessible
   - If files were deleted, restore from backup storage

5. **Verify Restoration**: Check that all documents are accessible

## Migration Script

### Migrate Existing Files to Supabase Storage

Use the migration script to move files from filesystem to Supabase Storage:

```bash
# Dry run (preview only)
npx tsx scripts/migrate-files-to-supabase.ts --dry-run

# Migrate all files
npx tsx scripts/migrate-files-to-supabase.ts

# Migrate with options
npx tsx scripts/migrate-files-to-supabase.ts \
  --limit=100 \
  --batch-size=10 \
  --skip-existing

# Migrate specific project
npx tsx scripts/migrate-files-to-supabase.ts \
  --project-id=project-uuid-123
```

### Migration Options

- `--dry-run`: Preview changes without making them
- `--limit=N`: Limit migration to N documents
- `--batch-size=N`: Process N documents at a time (default: 10)
- `--skip-existing`: Skip documents already in Supabase Storage
- `--project-id=ID`: Migrate only documents for a specific project

### Migration Process

1. **Identify Files**: Script finds all filesystem-stored documents
2. **Read Files**: Reads files from filesystem
3. **Upload to Supabase**: Uploads files to Supabase Storage
4. **Update Database**: Updates database records with new URLs
5. **Preserve Original**: Keeps original path in metadata for reference

## Cost Management

### Cost Estimation

The monitoring endpoint provides cost estimates based on:
- Storage usage: $0.021/GB/month (Supabase Pro)
- Bandwidth usage: $0.09/GB (Supabase Pro)

### Cost Optimization Tips

1. **Compress Files**: Compress large files before upload
2. **Archive Old Files**: Move old files to cheaper storage
3. **Clean Up**: Remove unused/orphaned files regularly
4. **Monitor Usage**: Track storage usage to avoid surprises
5. **Set Alerts**: Configure alerts for cost thresholds

## Best Practices

### Monitoring

1. **Regular Checks**: Review storage usage weekly
2. **Set Alerts**: Configure alerts for quota thresholds
3. **Track Trends**: Monitor storage growth over time
4. **Investigate Alerts**: Address warnings promptly

### Backup

1. **Automate**: Set up automated backups
2. **Test**: Regularly test backup restoration
3. **Store Securely**: Keep backups in secure, separate location
4. **Document**: Maintain backup logs and procedures
5. **Retention**: Follow retention policies

### Migration

1. **Test First**: Always run dry-run before migration
2. **Backup First**: Create backup before migration
3. **Batch Processing**: Use batch processing for large migrations
4. **Monitor Progress**: Watch migration progress
5. **Verify Results**: Verify migrated files after completion

## Troubleshooting

### Storage Quota Exceeded

1. **Check Usage**: Review storage usage via monitoring endpoint
2. **Clean Up**: Remove unused files
3. **Archive**: Move old files to archive storage
4. **Upgrade**: Consider upgrading storage plan

### Missing Files

1. **Check Database**: Verify document records exist
2. **Check Storage**: Verify files exist in Supabase Storage
3. **Check Paths**: Verify storage paths are correct
4. **Restore**: Restore from backup if needed

### Migration Failures

1. **Check Logs**: Review migration script output
2. **Verify Files**: Ensure source files exist
3. **Check Permissions**: Verify Supabase credentials
4. **Retry**: Retry failed migrations individually

## Support

For issues or questions:
- Check monitoring endpoint: `/api/admin/storage/monitor`
- Review backup endpoint: `/api/admin/storage/backup`
- Check migration script: `scripts/migrate-files-to-supabase.ts`
- Review Supabase Storage documentation
