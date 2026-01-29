# 📁 Programs & Projects Document Storage Structure

## Overview

Programs and project reports are now organized using a **year/project/date/version** folder structure in Supabase Storage, making it easy to:
- Organize documents by year
- Group by project
- Track by date
- Manage versions

## Folder Structure

### For Programs/Projects Documents

```
documents/
└── {year}/
    └── {project-code-or-name}/
        └── {date}/
            └── {version}/
                └── {filename}
```

### Examples

#### Example 1: Progress Report
```
documents/
└── 2026/
    └── MEALS-Project/
        └── 2026-01-29/
            └── v1.0/
                └── progress_report_q1_2026.pdf
```

#### Example 2: Updated Report (New Version)
```
documents/
└── 2026/
    └── MEALS-Project/
        └── 2026-01-29/
            ├── v1.0/
            │   └── progress_report_q1_2026.pdf
            └── v2.0/
                └── progress_report_q1_2026.pdf
```

#### Example 3: Video Report
```
documents/
└── 2026/
    └── Community-Water-Project/
        └── 2026-01-29/
            └── v1.0/
                └── project_video_report.mp4
```

## How It Works

### When Uploading Project Documents

When uploading a document with project information:

1. **Year**: Extracted from:
   - `year` parameter (if provided)
   - `date` parameter (if provided)
   - Project `startDate` (if projectId provided)
   - Current year (fallback)

2. **Project**: Uses:
   - `projectCode` (if provided)
   - `projectName` (if provided)
   - Project name from database (if projectId provided)
   - `projectId` (fallback)

3. **Date**: Uses:
   - `date` parameter (if provided, format: YYYY-MM-DD)
   - Current date (fallback)

4. **Version**: Uses:
   - `version` parameter (if provided)
   - Default: "1.0"

### Upload Parameters

When uploading via API or form, include these fields:

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('title', 'Project Progress Report')
formData.append('category', 'Progress Reports')
formData.append('projectId', 'project-uuid-123')        // Optional: Link to project
formData.append('projectCode', 'MEALS-2026')            // Optional: Project code
formData.append('projectName', 'MEALS Project')         // Optional: Project name
formData.append('year', '2026')                         // Optional: Year
formData.append('date', '2026-01-29')                  // Optional: Date (YYYY-MM-DD)
formData.append('version', '1.0')                      // Optional: Version
```

### Automatic Structure Detection

The system automatically detects if a document is a project document:

- ✅ If `projectId`, `projectName`, or `projectCode` is provided → Uses year/project/date/version structure
- ❌ Otherwise → Uses default department/subunit/category structure

## Supported File Types

All file types are supported:

### Documents
- PDF, Word, Excel, PowerPoint
- Text files, CSV
- Any document format

### Images
- JPEG, PNG, GIF, WebP
- SVG, BMP, TIFF
- Any image format

### Videos
- MP4, MOV, AVI, WebM
- WMV, MPEG
- Any video format

### Audio
- MP3, WAV, OGG
- Any audio format

### Archives
- ZIP, RAR, 7Z
- Any archive format

## File Size Limits

- **Videos/Large files**: Up to 100MB (configurable in Supabase)
- **Other files**: Up to 10MB (configurable in Supabase)

**Note**: To support larger files (e.g., GB-sized videos), increase the file size limit in Supabase Dashboard → Storage → Buckets → `documents` → Settings.

## Database Storage

Document metadata is stored in the `documents` table:

- `projectId`: Links to project (if applicable)
- `version`: Document version (default: "1.0")
- `folderPath`: Full folder path (e.g., "2026/MEALS-Project/2026-01-29/v1.0")
- `customMetadata`: Contains:
  - `projectId`
  - `projectName`
  - `projectCode`
  - `year`
  - `date`
  - `version`

## Querying Project Documents

### Get all documents for a project

```typescript
const documents = await prisma.documents.findMany({
  where: {
    projectId: 'project-uuid-123'
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### Get documents by year

```typescript
const documents = await prisma.documents.findMany({
  where: {
    customMetadata: {
      path: ['year'],
      equals: '2026'
    }
  }
})
```

### Get documents by version

```typescript
const documents = await prisma.documents.findMany({
  where: {
    projectId: 'project-uuid-123',
    version: '2.0'
  }
})
```

## Migration from Old Structure

If you have existing project documents using the old structure (`Programs/Projects/Project Documents/{projectCode}`), they will continue to work. New uploads will automatically use the new year/project/date/version structure.

To migrate existing documents:

1. Update the `folderPath` in the database
2. Optionally move files in Supabase Storage to match the new structure
3. Update `customMetadata` with year/date/version information

## Best Practices

1. **Always provide projectId** when uploading project documents
2. **Use consistent project codes** for easier organization
3. **Include version numbers** for document revisions
4. **Use ISO date format** (YYYY-MM-DD) for dates
5. **Compress large videos** before upload when possible
6. **Use descriptive filenames** that include project and date

## Examples

### Example: Uploading a Project Report

```typescript
// Frontend code
const uploadProjectReport = async (file: File, projectId: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', 'Q1 2026 Progress Report')
  formData.append('category', 'Progress Reports')
  formData.append('projectId', projectId)
  formData.append('date', '2026-01-29')
  formData.append('version', '1.0')
  
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData
  })
  
  return response.json()
}
```

### Example: Uploading a Video Report

```typescript
const uploadVideoReport = async (file: File, projectCode: string) => {
  const formData = new FormData()
  formData.append('file', file) // Video file (MP4, etc.)
  formData.append('title', 'Project Video Report')
  formData.append('category', 'Media')
  formData.append('projectCode', projectCode)
  formData.append('year', '2026')
  formData.append('date', new Date().toISOString().split('T')[0])
  formData.append('version', '1.0')
  
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData
  })
  
  return response.json()
}
```

## Storage Location

All files are stored in Supabase Storage bucket: **`documents`**

- **Production**: Supabase Storage (cloud)
- **Development**: Filesystem fallback (if Supabase not configured)

## Access Control

- Documents are stored in **private buckets**
- Access via **signed URLs** (1 hour expiry)
- Access controlled by:
  - User authentication
  - Project permissions
  - Document classification
