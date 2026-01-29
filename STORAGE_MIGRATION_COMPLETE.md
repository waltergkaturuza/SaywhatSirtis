# ✅ Complete Storage Migration Summary

## All File Upload Endpoints Updated

All file upload endpoints across SIRTIS have been updated to use **Supabase Storage** as the primary storage solution, with automatic fallback to filesystem storage for local development.

### Updated Endpoints

1. **✅ Profile Picture Upload**
   - **Endpoint:** `POST /api/employee/profile/picture`
   - **Bucket:** `documents`
   - **Path:** `profiles/{employeeId}/{filename}`
   - **Status:** ✅ Complete

2. **✅ Qualification Certificate Upload**
   - **Endpoint:** `POST /api/employee/qualifications/[id]/certificate`
   - **Bucket:** `documents`
   - **Path:** `certificates/{employeeId}/{qualificationId}/{filename}`
   - **Status:** ✅ Complete

3. **✅ Document Upload**
   - **Endpoint:** `POST /api/documents/upload`
   - **Bucket:** `documents` or `risk-documents`
   - **Path:** Dynamic (department/subunit/category or year/project/date/version)
   - **Status:** ✅ Complete

4. **✅ Document Version Upload**
   - **Endpoint:** `POST /api/documents/versions/upload`
   - **Bucket:** Inherits from parent document
   - **Path:** Same folder as parent, new filename
   - **Status:** ✅ Complete

5. **✅ Risk Document Upload**
   - **Endpoint:** `POST /api/risk-management/documents/upload`
   - **Bucket:** `risk-documents`
   - **Path:** `risk-documents/{riskId}/{filename}`
   - **Status:** ✅ Complete

6. **✅ HR Certificates Upload**
   - **Endpoint:** `POST /api/hr/certificates`
   - **Bucket:** `documents`
   - **Path:** `certificates/hr/{employeeId}/{filename}`
   - **Status:** ✅ Complete

## Storage Structure

### Documents Bucket (`documents`)
```
documents/
├── profiles/
│   └── {employeeId}/
│       └── profile-{employeeId}-{uuid}.{ext}
│
├── certificates/
│   ├── {employeeId}/
│   │   └── {qualificationId}/
│   │       └── certificate-{qualificationId}-{uuid}.{ext}
│   └── hr/
│       └── {employeeId}/
│           └── certificate-{timestamp}-{index}-{uuid}.{ext}
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

### Risk Documents Bucket (`risk-documents`)
```
risk-documents/
└── {riskId}/
    └── {filename}
```

## Querying Documents

### By Employee ID
```typescript
// Profile pictures
const user = await prisma.users.findUnique({
  where: { id: employeeId },
  select: { profileImage: true }
});

// Certificates
const certificates = await prisma.qualifications.findMany({
  where: { employeeId },
  select: { certificateUrl: true }
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
    projectId: projectId
    // OR
    customMetadata: {
      path: ['projectId'],
      equals: projectId
    }
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

## File Access Patterns

### Profile Pictures
- Stored directly in `users.profileImage` field
- Can be used directly: `<img src={user.profileImage} />`
- Supabase signed URLs are generated automatically

### Certificates
- Stored in `qualifications.certificateUrl` field
- Use for downloads: `<a href={certificateUrl}>Download</a>`
- Signed URLs expire after 1 hour (regenerated on access)

### Documents
- Use download endpoint: `GET /api/documents/[id]/download`
- Use view endpoint: `GET /api/documents/[id]/view`
- Automatically handles Supabase signed URLs

## Metadata Storage

All files include metadata in database:

**Profile Pictures:**
- `users.profileImage` - URL to image

**Certificates:**
- `qualifications.certificateUrl` - URL to certificate

**Documents:**
- `documents.url` - Storage URL
- `documents.path` - Storage path
- `documents.customMetadata` - Contains:
  ```json
  {
    "storageProvider": "supabase" | "filesystem",
    "storageBucket": "documents" | "risk-documents" | null,
    "storagePath": "profiles/emp-123/profile.jpg",
    "relatedEmployeeId": "emp-123",
    "projectId": "project-uuid",
    "uploadedAt": "2026-01-29T12:00:00Z"
  }
  ```

## Next Steps

1. **✅ All upload endpoints updated** - Complete
2. **✅ Storage structure defined** - Complete
3. **✅ Query patterns documented** - Complete
4. **⚠️ Verify Supabase buckets exist** - Required
5. **⚠️ Set up RLS policies** - Required (see `RENDER_SUPABASE_STORAGE_SETUP_CHECKLIST.md`)
6. **✅ Migration script available** - Complete (see `scripts/migrate-files-to-supabase.ts`)

## Testing

To test the implementation:

1. **Upload a profile picture:**
   ```bash
   curl -X POST /api/employee/profile/picture \
     -F "profilePicture=@image.jpg"
   ```

2. **Upload a certificate:**
   ```bash
   curl -X POST /api/employee/qualifications/{id}/certificate \
     -F "certificate=@cert.pdf"
   ```

3. **Upload a document:**
   ```bash
   curl -X POST /api/documents/upload \
     -F "file=@document.pdf" \
     -F "title=Test Document" \
     -F "category=Contracts"
   ```

4. **Check Supabase Dashboard:**
   - Go to Storage → Buckets → `documents`
   - Verify files appear in correct folders
   - Check file metadata

## Benefits

✅ **Render-Compatible:** Files stored in cloud, not filesystem  
✅ **Scalable:** Handles large files and high volumes  
✅ **Secure:** Private buckets with signed URLs  
✅ **Organized:** Clear folder structure for easy querying  
✅ **Backward Compatible:** Falls back to filesystem for local dev  
✅ **Queryable:** Metadata stored in database for easy filtering  

## Support

For issues or questions:
- Check `COMPLETE_STORAGE_IMPLEMENTATION.md` for detailed guide
- Review `RENDER_SUPABASE_STORAGE_SETUP_CHECKLIST.md` for setup
- See `MIGRATION_SCRIPT_SETUP.md` for migrating existing files
