# ✅ Render + Supabase Storage Setup Checklist

## Current Status

### ✅ Already Configured

1. **Supabase Storage Buckets** - ✅ CREATED
   - `documents` bucket exists (from your screenshot)
   - `risk-documents` bucket exists (from your screenshot)
   - Both configured with "Any" MIME types ✅
   - File size limits: 50MB (can be increased if needed)

2. **Database Connection** - ✅ CONFIGURED IN RENDER
   - `DATABASE_URL` ✅ Set in `render.yaml`
   - `DIRECT_URL` ✅ Set in `render.yaml`
   - Both pointing to Supabase PostgreSQL ✅

3. **Supabase URL** - ✅ CONFIGURED IN RENDER
   - `SUPABASE_URL` ✅ Set in `render.yaml`
   - Value: `https://yuwwqupyqpmkbqzvqiee.supabase.co`

### ✅ Already Configured in Render

1. **Supabase Service Role Key** - ✅ SET
   - `SUPABASE_SERVICE_ROLE_KEY` ✅ Already configured in Render
   - This enables file uploads/downloads to Supabase Storage

2. **Supabase Anon Key** - ✅ SET
   - `SUPABASE_ANON_KEY` ✅ Already configured
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ Also set for client-side

3. **Supabase URL** - ✅ SET
   - `SUPABASE_URL` ✅ Already configured
   - `NEXT_PUBLIC_SUPABASE_URL` ✅ Also set for client-side

### ⚠️ Needs Configuration

1. **RLS Policies** - ❌ NEEDS TO BE SET UP IN SUPABASE
   - Storage buckets need Row Level Security policies
   - **Action Required**: Run SQL policies in Supabase SQL Editor
   - **Status**: Without these, file operations will fail with permission errors

2. **Old Documents Migration** - ❌ NOT YET MIGRATED
   - Existing filesystem files need to be migrated
   - **Action Required**: Run migration script (optional, can be done gradually)

---

## Step-by-Step Setup Instructions

### Step 1: Verify Environment Variables ✅ **ALREADY DONE**

All required environment variables are already set in Render:
- ✅ `SUPABASE_URL` - Set
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Set
- ✅ `SUPABASE_ANON_KEY` - Set
- ✅ `DATABASE_URL` - Set

**Status**: ✅ All environment variables are configured correctly!

### Step 2: Set Up RLS Policies in Supabase ⚠️ **REQUIRED**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `yuwwqupyqpmkbqzvqiee`
3. Go to **SQL Editor**
4. Run these SQL commands:

```sql
-- Allow authenticated users to upload to 'documents' bucket
CREATE POLICY "Allow authenticated uploads documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read from 'documents' bucket
CREATE POLICY "Allow authenticated reads documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to upload to 'risk-documents' bucket
CREATE POLICY "Allow authenticated uploads risk-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'risk-documents');

-- Allow authenticated users to read from 'risk-documents' bucket
CREATE POLICY "Allow authenticated reads risk-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'risk-documents');
```

**Why this is needed**: RLS policies control who can upload/read files. Without these, file operations will fail.

### Step 3: Test File Upload/Download ✅ **VERIFY IT WORKS**

Before migrating old documents, test that new uploads work:

1. Go to your app: https://sirtis-saywhat.onrender.com
2. Upload a test document
3. Check Supabase Dashboard → Storage → `documents` bucket
4. Verify the file appears ✅
5. Download the document
6. Verify it downloads correctly ✅

If this works, your setup is complete! If you get permission errors, complete Step 2 (RLS Policies) first.

### Step 4: Migrate Old Documents ⏳ **OPTIONAL BUT RECOMMENDED**

Old documents stored on filesystem need to be migrated to Supabase Storage.

**Option A: Run Migration Script Locally** (if you have local access to files)

```bash
# Preview what will be migrated (dry run)
npx tsx scripts/migrate-files-to-supabase.ts --dry-run

# Migrate all files
npx tsx scripts/migrate-files-to-supabase.ts

# Migrate in batches (safer for large datasets)
npx tsx scripts/migrate-files-to-supabase.ts --limit=100 --batch-size=10
```

**Option B: Gradual Migration** (recommended)
- New uploads automatically go to Supabase Storage ✅
- Old files remain on filesystem (will work until Render container restarts)
- Migrate old files gradually as needed

**Note**: Since Render doesn't have persistent filesystem, filesystem-stored files will be lost on container restart. Migration is recommended.

### Step 5: Increase File Size Limits (Optional)

If you need to upload files larger than 50MB:

1. Go to Supabase Dashboard → **Storage** → **Buckets**
2. Click on `documents` bucket
3. Go to **Settings**
4. Increase **File size limit** (e.g., 500MB for videos)
5. Repeat for `risk-documents` bucket if needed

---

## Verification Checklist

After completing the setup, verify everything works:

- [x] `SUPABASE_SERVICE_ROLE_KEY` is set in Render Dashboard ✅ **DONE**
- [x] `SUPABASE_URL` is set in Render Dashboard ✅ **DONE**
- [x] `SUPABASE_ANON_KEY` is set in Render Dashboard ✅ **DONE**
- [ ] RLS policies are created in Supabase SQL Editor ⚠️ **NEEDS TO BE DONE**
- [ ] Test upload: Upload a new document via the app → **TEST THIS**
- [ ] Check Supabase Dashboard → Storage → `documents` bucket → File appears ✅
- [ ] Test download: Download the document → Works ✅
- [ ] Check monitoring: Visit `/api/admin/storage/monitor` → Shows storage stats ✅

---

## What's Already Working ✅

1. **New Uploads**: ✅ Already working
   - New files automatically upload to Supabase Storage
   - Code is deployed and live on Render

2. **Database**: ✅ Already connected
   - Render connects to Supabase PostgreSQL
   - All database operations work

3. **Buckets**: ✅ Already created
   - `documents` bucket exists
   - `risk-documents` bucket exists

---

## Summary

### What You Need to Do:

1. **Set up RLS Policies in Supabase** ⚠️ **REQUIRED** (Only missing piece!)
   - Without these, file operations will fail with permission errors
   - See Step 2 in the instructions above

2. **Test File Upload/Download** ✅ **VERIFY**
   - Upload a test document to confirm everything works
   - If you get permission errors, complete RLS policies first

3. **Migrate Old Documents** ⏳ **OPTIONAL**
   - Old files will work until container restarts
   - Migration script is ready to use when needed

### What's Already Done:

- ✅ Buckets created in Supabase
- ✅ Database connected to Render
- ✅ All environment variables set in Render (including `SUPABASE_SERVICE_ROLE_KEY`)
- ✅ Code deployed and live
- ✅ New uploads go to Supabase Storage automatically

---

## Quick Reference

**Render Environment Variables Status**:
- `SUPABASE_URL` ✅ Already set
- `SUPABASE_SERVICE_ROLE_KEY` ✅ **ALREADY SET** (Great!)
- `SUPABASE_ANON_KEY` ✅ Already set
- `NEXT_PUBLIC_SUPABASE_URL` ✅ Already set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ Already set

**Supabase Configuration Needed**:
- RLS Policies ❌ **NEEDS TO BE SET**
- Buckets ✅ Already created

**Migration**:
- Script ready: `scripts/migrate-files-to-supabase.ts`
- Can run locally or wait for gradual migration

---

## Need Help?

- **Storage Setup**: See `SUPABASE_STORAGE_SETUP.md`
- **Migration Guide**: See `STORAGE_MONITORING_AND_BACKUP.md`
- **Monitoring**: Use `/api/admin/storage/monitor` endpoint
