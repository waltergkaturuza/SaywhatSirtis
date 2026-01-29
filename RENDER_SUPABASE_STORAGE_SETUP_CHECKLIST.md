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

### ⚠️ Needs Configuration

1. **Supabase Service Role Key** - ❌ NEEDS TO BE SET IN RENDER DASHBOARD
   - `SUPABASE_SERVICE_ROLE_KEY` is marked as `sync: false` in `render.yaml`
   - **Action Required**: Set this manually in Render Dashboard

2. **Supabase Anon Key** - ⚠️ OPTIONAL (for client-side operations)
   - `SUPABASE_ANON_KEY` is marked as `sync: false` in `render.yaml`
   - **Action Required**: Set this manually if needed

3. **RLS Policies** - ❌ NEEDS TO BE SET UP IN SUPABASE
   - Storage buckets need Row Level Security policies
   - **Action Required**: Run SQL policies in Supabase SQL Editor

4. **Old Documents Migration** - ❌ NOT YET MIGRATED
   - Existing filesystem files need to be migrated
   - **Action Required**: Run migration script

---

## Step-by-Step Setup Instructions

### Step 1: Set Supabase Service Role Key in Render ⚠️ **REQUIRED**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service: `saywhat-sirtis`
3. Go to **Environment** tab
4. Find or add: `SUPABASE_SERVICE_ROLE_KEY`
5. Get the value from [Supabase Dashboard](https://supabase.com/dashboard):
   - Go to your project: `yuwwqupyqpmkbqzvqiee`
   - Go to **Settings** → **API**
   - Copy the **`service_role`** key (⚠️ Keep this secret!)
6. Paste it into Render Environment Variables
7. Save

**Why this is needed**: The service role key allows your Render app to upload/download files to Supabase Storage buckets.

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

### Step 3: Migrate Old Documents ⏳ **OPTIONAL BUT RECOMMENDED**

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

### Step 4: Increase File Size Limits (Optional)

If you need to upload files larger than 50MB:

1. Go to Supabase Dashboard → **Storage** → **Buckets**
2. Click on `documents` bucket
3. Go to **Settings**
4. Increase **File size limit** (e.g., 500MB for videos)
5. Repeat for `risk-documents` bucket if needed

---

## Verification Checklist

After completing the setup, verify everything works:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Render Dashboard
- [ ] RLS policies are created in Supabase SQL Editor
- [ ] Test upload: Upload a new document via the app
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

1. **Set `SUPABASE_SERVICE_ROLE_KEY` in Render Dashboard** ⚠️ **REQUIRED**
   - Without this, file uploads/downloads won't work

2. **Set up RLS Policies in Supabase** ⚠️ **REQUIRED**
   - Without these, file operations will fail with permission errors

3. **Migrate Old Documents** ⏳ **OPTIONAL**
   - Old files will work until container restarts
   - Migration script is ready to use

### What's Already Done:

- ✅ Buckets created in Supabase
- ✅ Database connected to Render
- ✅ Code deployed and live
- ✅ New uploads go to Supabase Storage automatically

---

## Quick Reference

**Render Environment Variables Needed**:
- `SUPABASE_URL` ✅ Already set
- `SUPABASE_SERVICE_ROLE_KEY` ❌ **NEEDS TO BE SET**
- `SUPABASE_ANON_KEY` ⚠️ Optional

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
