# 🗄️ Complete Supabase Storage Implementation Guide

## Overview

All file uploads across SIRTIS now use **Supabase Storage** as the primary storage solution, with automatic fallback to filesystem storage for local development. This ensures files are properly stored in cloud storage when deployed to Render (which doesn't have persistent filesystem).

## Storage Buckets

### Primary Buckets

1. **`documents`** - Main document repository
   - Used for: All documents, employee profiles, certificates, project documents, HR documents
   - Structure: Organized by folder paths

2. **`risk-documents`** - Risk management documents
   - Used for: Risk assessments, risk-related attachments
   - Structure: `risk-documents/{riskId}/{filename}`

## Folder Structure

### Documents Bucket Structure

```
documents/
├── profiles/
│   └── {employeeId}/
│       └── profile-{employeeId}-{uuid}.{ext}
│
├── certificates/
│   └── {employeeId}/
│       └── {qualificationId}/
│           └── certificate-{qualificationId}-{uuid}.{ext}
│
├── {department}/
│   └── {subunit}/
│       └── {category}/
│           └── {filename}
│
└── {year}/
    └── {project}/
        └── {date}/
            └── {version}/
                └── {filename}
```

### Examples

**Profile Pictures:**
- `documents/profiles/emp-123/profile-emp-123-abc123.jpg`

**Certificates:**
- `documents/certificates/emp-123/qual-456/certificate-qual-456-def789.pdf`

**HR Documents:**
- `documents/Human Resource Management/Contracts/contract_123.pdf`
- `documents/Human Resource Management/Employee Profiles/John Doe emp-123/cv.pdf`

**Project Documents:**
- `documents/2026/MEALS-Project/2026-01-29/v1.0/progress_report.pdf`
- `documents/2026/MEALS-Project/2026-01-29/v2.0/progress_report_updated.pdf`

**Risk Documents:**
- `risk-documents/risk-abc-123/risk_assessment.pdf`

## Updated Endpoints

### ✅ Profile Picture Upload
**Endpoint:** `POST /api/employee/profile/picture`
- **Bucket:** `documents`
- **Path:** `profiles/{employeeId}/{filename}`
- **Storage:** Supabase Storage (with filesystem fallback)
- **Database:** Stores URL in `users.profileImage`

### ✅ Qualification Certificate Upload
**Endpoint:** `POST /api/employee/qualifications/[id]/certificate`
- **Bucket:** `documents`
- **Path:** `certificates/{employeeId}/{qualificationId}/{filename}`
- **Storage:** Supabase Storage (with filesystem fallback)
- **Database:** Stores URL in `qualifications.certificateUrl`

### ✅ Document Upload
**Endpoint:** `POST /api/documents/upload`
- **Bucket:** `documents` or `risk-documents` (based on context)
- **Path:** Dynamic based on department/subunit/category or year/project/date/version
- **Storage:** Supabase Storage (with filesystem fallback)
- **Database:** Stores URL and metadata in `documents` table

### ✅ Document Version Upload
**Endpoint:** `POST /api/documents/versions/upload`
- **Bucket:** Same as parent document
- **Path:** Same folder as parent, new filename
- **Storage:** Supabase Storage (inherits from parent) or filesystem fallback
- **Database:** Creates new version in `documents` table

### ✅ Risk Document Upload
**Endpoint:** `POST /api/risk-management/documents/upload`
- **Bucket:** `risk-documents`
- **Path:** `risk-documents/{riskId}/{filename}`
- **Storage:** Supabase Storage (with filesystem fallback)
- **Database:** Stores URL in `documents` table

## Querying Documents

### By Employee

```typescript
// Profile pictures
const user = await prisma.users.findUnique({
  where: { id: employeeId },
  select: { profileImage: true }
});

// Certificates
const certificates = await prisma.qualifications.findMany({
  where: { employeeId },
  select: { certificateUrl: true, id: true }
});

// Employee documents
const employeeDocs = await prisma.documents.findMany({
  where: {
    customMetadata: {
      path: ['relatedEmployeeId'],
      equals: employeeId
    }
  }
});
```

### By Project

```typescript
const projectDocs = await prisma.documents.findMany({
  where: {
    projectId: projectId,
    // OR
    customMetadata: {
      path: ['projectId'],
      equals: projectId
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

### By Department/Category

```typescript
const hrDocs = await prisma.documents.findMany({
  where: {
    department: 'Human Resource Management',
    category: 'Contracts'
  }
});
```

### By Storage Provider

```typescript
const supabaseDocs = await prisma.documents.findMany({
  where: {
    customMetadata: {
      path: ['storageProvider'],
      equals: 'supabase'
    }
  }
});
```

### By Bucket

```typescript
const documentsBucketFiles = await prisma.documents.findMany({
  where: {
    customMetadata: {
      path: ['storageBucket'],
      equals: 'documents'
    }
  }
});
```

## File Access

### Profile Pictures
- **Direct URL:** Stored in `users.profileImage`
- **Access:** Public or signed URL (depending on bucket settings)
- **Usage:** `<img src={user.profileImage} />`

### Certificates
- **Direct URL:** Stored in `qualifications.certificateUrl`
- **Access:** Signed URL (1 hour expiry)
- **Usage:** `<a href={certificateUrl}>Download</a>`

### Documents
- **Download:** `GET /api/documents/[id]/download`
  - Generates signed URL for Supabase-stored files
  - Falls back to filesystem for legacy files
- **View:** `GET /api/documents/[id]/view`
  - Streams file content for preview
  - Supports PDF, images, text files

## Storage Metadata

All documents stored in Supabase include metadata in `customMetadata`:

```typescript
{
  storageProvider: 'supabase' | 'filesystem',
  storageBucket: 'documents' | 'risk-documents' | null,
  storagePath: 'profiles/emp-123/profile.jpg' | null,
  uploadedAt: '2026-01-29T12:00:00Z',
  // ... other custom metadata
}
```

## Migration Status

### ✅ Completed
- [x] Document upload endpoint
- [x] Document download endpoint
- [x] Document version upload endpoint
- [x] Risk document upload endpoint
- [x] Profile picture upload endpoint
- [x] Qualification certificate upload endpoint
- [x] Storage utility functions
- [x] Fallback to filesystem for local development

### 🔄 Migration Script
- [x] Migration script for existing files
- [x] Handles already-migrated files
- [x] Batch processing support

## Setup Requirements

### 1. Supabase Buckets
Create these buckets in Supabase Dashboard:
- `documents` (private)
- `risk-documents` (private)

### 2. RLS Policies
Set up Row Level Security policies for authenticated access (see `RENDER_SUPABASE_STORAGE_SETUP_CHECKLIST.md`)

### 3. Environment Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

## Best Practices

1. **Always use signed URLs** for private files
2. **Store metadata** in database, not just URLs
3. **Use consistent folder structures** for easy querying
4. **Include employee/project IDs** in customMetadata for filtering
5. **Handle both storage providers** gracefully (Supabase + filesystem fallback)

## Troubleshooting

### Files not uploading to Supabase
- Check environment variables are set
- Verify bucket exists in Supabase Dashboard
- Check RLS policies allow uploads
- Review server logs for errors

### Files not downloading
- Verify signed URL generation works
- Check file path matches storage path
- Ensure RLS policies allow reads
- Check if file exists in Supabase Storage

### Query performance
- Index `customMetadata` fields if needed
- Use specific filters (employeeId, projectId)
- Consider pagination for large result sets
