# 🗄️ Supabase Storage Setup Guide for SIRTIS

## Overview

SIRTIS now uses **Supabase Storage** as the primary file storage solution, with automatic fallback to filesystem storage for local development. This ensures files are properly stored in cloud storage when deployed to Render (which doesn't have persistent filesystem).

## Architecture

### Storage Strategy

1. **Primary**: Supabase Storage (production)
   - Files uploaded to Supabase Storage buckets
   - URLs stored in database `url` field
   - Signed URLs generated for secure access

2. **Fallback**: Filesystem (local development)
   - Files saved to `public/uploads/` directory
   - Only used when Supabase is not configured

### Storage Buckets

The following buckets are used:

- **`documents`**: Main document repository
  - **Default structure**: `{department}/{subunit}/{category}/{filename}`
    - Example: `HR/Contracts/contract_123.pdf`
  - **Programs/Projects structure**: `{year}/{project}/{date}/{version}/{filename}`
    - Example: `2026/MEALS-Project/2026-01-29/v1.0/progress_report.pdf`
    - Example: `2026/MEALS-Project/2026-01-29/v2.0/progress_report_updated.pdf`
  - Supports: Documents, images, videos, audio, archives

- **`risk-documents`**: Risk management documents
  - Path structure: `risk-documents/{riskId}/{filename}`
  - Example: `risk-documents/abc-123/risk_assessment.pdf`

## Setup Instructions

### 1. Create Supabase Storage Buckets

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** → **Buckets**
3. Create the following buckets:

#### Bucket: `documents`
- **Name**: `documents`
- **Public**: `false` (private bucket, uses signed URLs)
- **File size limit**: 10MB (or as needed)
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `application/vnd.ms-excel`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `text/plain`

#### Bucket: `risk-documents`
- **Name**: `risk-documents`
- **Public**: `false` (private bucket, uses signed URLs)
- **File size limit**: 100MB (or as needed)
- **Allowed MIME types**: `Any` (recommended, same as `documents` bucket)

### 2. Configure Storage Policies (Row Level Security)

For each bucket, set up RLS policies to control access:

#### Policy: Allow authenticated uploads
```sql
-- For 'documents' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- For 'risk-documents' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'risk-documents');
```

#### Policy: Allow authenticated reads
```sql
-- For 'documents' bucket
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- For 'risk-documents' bucket
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'risk-documents');
```

### 3. Environment Variables

Ensure these environment variables are set in your `.env` files and Render/Vercel:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here  # Optional, for client-side operations

# Database (already configured)
DATABASE_URL=postgresql://...
```

### 4. Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side file operations:
- Upload files
- Generate signed URLs
- Delete files
- List files

**⚠️ Security Note**: Never expose the service role key in client-side code. It bypasses RLS policies.

## Implementation Details

### File Upload Flow

1. **Client** uploads file via form
2. **API Route** receives file
3. **Storage Utility** checks if Supabase is configured
4. **If Supabase available**:
   - Uploads to Supabase Storage bucket
   - Gets signed/public URL
   - Stores URL in database
5. **If Supabase not available**:
   - Falls back to filesystem
   - Stores path in database

### File Download Flow

1. **Client** requests file download
2. **API Route** fetches document from database
3. **Storage Utility** checks storage provider:
   - **Supabase**: Generates signed URL (1 hour expiry) and redirects
   - **Filesystem**: Reads file from disk and streams
   - **Direct URL**: Redirects to URL

### Storage Metadata

Document storage information is stored in `customMetadata` JSON field:

```json
{
  "storageProvider": "supabase" | "filesystem",
  "storageBucket": "documents" | "risk-documents" | null,
  // ... other metadata
}
```

## Migration from Filesystem to Supabase Storage

### For Existing Files

Existing files stored on filesystem will continue to work. To migrate:

1. **Option 1**: Manual migration script (recommended for small datasets)
   - Read files from filesystem
   - Upload to Supabase Storage
   - Update database records

2. **Option 2**: Gradual migration
   - New uploads go to Supabase Storage
   - Old files remain on filesystem
   - Download endpoint handles both

### Migration Script Example

```typescript
// scripts/migrate-files-to-supabase.ts
import { prisma } from '@/lib/prisma'
import { uploadToSupabaseStorage } from '@/lib/storage/supabase-storage'
import { readFile } from 'fs/promises'
import path from 'path'

async function migrateDocument(documentId: string) {
  const document = await prisma.documents.findUnique({
    where: { id: documentId }
  })

  if (!document || !document.path) return

  // Check if already migrated
  const metadata = document.customMetadata as any
  if (metadata?.storageProvider === 'supabase') {
    console.log(`✅ Already migrated: ${documentId}`)
    return
  }

  try {
    // Read file from filesystem
    const filePath = path.join(process.cwd(), 'public', document.path)
    const fileBuffer = await readFile(filePath)

    // Upload to Supabase Storage
    const uploadResult = await uploadToSupabaseStorage({
      bucket: 'documents',
      path: document.path,
      file: fileBuffer,
      contentType: document.mimeType
    })

    if (uploadResult.success) {
      // Update database record
      await prisma.documents.update({
        where: { id: documentId },
        data: {
          url: uploadResult.url,
          customMetadata: {
            ...metadata,
            storageProvider: 'supabase',
            storageBucket: 'documents'
          }
        }
      })

      console.log(`✅ Migrated: ${documentId}`)
    }
  } catch (error) {
    console.error(`❌ Failed to migrate ${documentId}:`, error)
  }
}
```

## Testing

### Test Upload

1. Navigate to document upload page
2. Upload a test file
3. Check console logs for:
   - `✅ File uploaded to Supabase Storage: {path}`
   - `📎 Storage URL: {url}`

### Test Download

1. Navigate to document list
2. Click download on a document
3. Verify file downloads correctly
4. Check browser network tab for signed URL redirect

### Verify in Supabase Dashboard

1. Go to **Storage** → **Buckets** → `documents`
2. Verify files appear in the bucket
3. Check file paths match expected structure

## Troubleshooting

### Issue: "Bucket does not exist"

**Solution**: Create the bucket in Supabase Dashboard (see Setup Instructions #1)

### Issue: "Upload failed: Access denied"

**Solution**: 
1. Check RLS policies are set correctly
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Ensure service role key has proper permissions

### Issue: "Signed URL generation failed"

**Solution**:
1. Verify bucket exists
2. Check file path is correct
3. Ensure service role key has read permissions

### Issue: Files not appearing in Supabase Storage

**Solution**:
1. Check console logs for errors
2. Verify environment variables are set
3. Check Supabase project is active (not paused)

## Best Practices

1. **Always use signed URLs** for private files (not public URLs)
2. **Set appropriate expiry times** for signed URLs (default: 1 hour)
3. **Store storage provider** in metadata for easy migration
4. **Use consistent path structures** for easy organization
5. **Monitor storage usage** in Supabase Dashboard
6. **Set up backups** for critical documents

## Cost Considerations

### Supabase Storage Pricing

- **Free Tier**: 1GB storage, 2GB bandwidth/month
- **Pro Tier**: $0.021/GB storage, $0.09/GB bandwidth

### Optimization Tips

1. **Compress files** before upload when possible
2. **Use appropriate file formats** (e.g., PDF instead of high-res images)
3. **Clean up old/unused files** regularly
4. **Archive old documents** to cheaper storage if needed

## Security

### Access Control

- Files are stored in **private buckets** by default
- **Signed URLs** provide time-limited access
- **RLS policies** control who can upload/read
- **Service role key** never exposed to clients

### Compliance

- Files stored in Supabase Storage are encrypted at rest
- Transfer uses HTTPS/TLS encryption
- Access logs available in Supabase Dashboard
- GDPR/Compliance-friendly storage location

## Next Steps

1. ✅ Create Supabase Storage buckets
2. ✅ Configure RLS policies
3. ✅ Set environment variables
4. ✅ Test file upload/download
5. ⏳ Migrate existing files (optional)
6. ⏳ Set up monitoring/alerts
7. ⏳ Configure backup strategy

## Support

For issues or questions:
- Check Supabase Storage [documentation](https://supabase.com/docs/guides/storage)
- Review SIRTIS codebase: `src/lib/storage/supabase-storage.ts`
- Check API routes: `src/app/api/documents/upload/route.ts`
