# 🔧 Migration Script Setup Guide

## Quick Setup

The migration script needs environment variables to connect to Supabase Storage. Here's how to set it up:

### Option 1: Add to `.env.local` (Recommended)

1. Open `.env.local` in your project root (create it if it doesn't exist)
2. Add these lines:

```bash
# Supabase Storage Configuration
SUPABASE_URL=https://yuwwqupyqpmkbqzvqiee.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3dxdXB5cXBta2JxenZxaWVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAwNTc4MSwiZXhwIjoyMDY4NTgxNzgxfQ.viAUas1_iRn6MRnUH5VFMaxU6O_RaG-Pf-uZyRLgx6Y

# Database Configuration (if not already set)
DATABASE_URL=postgresql://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Note**: The `SUPABASE_SERVICE_ROLE_KEY` value above is from your Render environment variables. Use that exact value.

### Option 2: Set Environment Variables in PowerShell

```powershell
# Set environment variables for current session
$env:SUPABASE_URL="https://yuwwqupyqpmkbqzvqiee.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d3dxdXB5cXBta2JxenZxaWVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAwNTc4MSwiZXhwIjoyMDY4NTgxNzgxfQ.viAUas1_iRn6MRnUH5VFMaxU6O_RaG-Pf-uZyRLgx6Y"
$env:DATABASE_URL="postgresql://postgres.yuwwqupyqpmkbqzvqiee:8FNI4OdtFINUw2GL@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Then run the migration script
npx tsx scripts/migrate-files-to-supabase.ts --dry-run
```

### Option 3: Install dotenv and Use .env File

If you want to use `.env` files (the script will auto-detect them):

```bash
npm install dotenv --save-dev
```

Then create `.env.local` with the variables above.

## Running the Migration

### 1. Test First (Dry Run)

```bash
npx tsx scripts/migrate-files-to-supabase.ts --dry-run
```

This will show you what would be migrated without making any changes.

### 2. Migrate All Files

```bash
npx tsx scripts/migrate-files-to-supabase.ts
```

### 3. Migrate in Batches (Safer)

```bash
# Migrate first 100 documents
npx tsx scripts/migrate-files-to-supabase.ts --limit=100 --batch-size=10

# Then continue with next batch
npx tsx scripts/migrate-files-to-supabase.ts --limit=200 --batch-size=10 --skip-existing
```

### 4. Migrate Specific Project

```bash
npx tsx scripts/migrate-files-to-supabase.ts --project-id=your-project-id
```

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"

**Solution**: Add these to `.env.local` or set as environment variables (see Option 1 or 2 above)

### Error: "DATABASE_URL must be set"

**Solution**: Add `DATABASE_URL` to `.env.local` or set as environment variable

### Error: "File not found"

**Solution**: The file might not exist on your local filesystem. The script will skip files that don't exist and continue.

### Error: "Bucket does not exist"

**Solution**: 
1. Go to Supabase Dashboard → Storage → Buckets
2. Create the `documents` and `risk-documents` buckets if they don't exist
3. See `SUPABASE_STORAGE_SETUP.md` for bucket creation instructions

### Error: "Access denied" or Permission errors

**Solution**: 
1. Set up RLS policies in Supabase (see `RENDER_SUPABASE_STORAGE_SETUP_CHECKLIST.md` Step 2)
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

## What Gets Migrated?

The script migrates documents that:
- Are stored on filesystem (have `path` but no `url` or `storageProvider` is not 'supabase')
- Have corresponding files on disk
- Are not already migrated (unless `--skip-existing` is used)

## After Migration

1. **Verify**: Check Supabase Dashboard → Storage → `documents` bucket
2. **Test**: Download a migrated document to verify it works
3. **Monitor**: Use `/api/admin/storage/monitor` to check storage usage

## Notes

- The script preserves original file paths in `customMetadata.originalPath`
- Files are uploaded to Supabase Storage with the same folder structure
- Database records are updated with new `url` and `storageProvider` metadata
- Original files on filesystem are NOT deleted (you can delete them manually after verification)
