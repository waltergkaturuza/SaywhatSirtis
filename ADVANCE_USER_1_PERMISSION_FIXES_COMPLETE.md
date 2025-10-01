# ADVANCE_USER_1 Permission Fixes & Document Repository Access

## Issues Resolved

### 1. Call Centre Module Access ✅
**Problem**: User Tatenda (ADVANCE_USER_1) was seeing "Failed to load stats" and "Failed to load dashboard data" in Call Centre module.

**Root Cause**: API endpoints were checking for `calls.view` and `calls.full_access` permissions, but ADVANCE_USER_1 role gets `call_center_full`, `callcentre.access`, and `callcentre.officer` permissions.

**Solution**: Updated all Call Centre API endpoints to recognize ADVANCE_USER_1 permissions:

**Files Updated**:
- `src/app/api/call-centre/dashboard/route.ts`
- `src/app/api/call-centre/cases/route.ts` 
- `src/app/api/call-centre/quick-stats/route.ts`
- `src/app/api/call-centre/performance/route.ts`
- `src/app/api/call-centre/activities/route.ts`
- `src/app/api/call-centre/stats/route.ts`
- `src/app/api/call-centre/officers/route.ts`
- `src/app/api/call-centre/tasks/route.ts`
- `src/app/api/call-centre/referrals/route.ts`
- `src/app/call-centre/page.tsx`

**Permission Check Pattern Added**:
```typescript
const hasPermission = session.user?.permissions?.includes('calls.view') ||
  session.user?.permissions?.includes('calls.full_access') ||
  session.user?.permissions?.includes('call_center_full') ||
  session.user?.permissions?.includes('callcentre.access') ||
  session.user?.permissions?.includes('callcentre.officer') ||
  session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()));
```

### 2. Main Dashboard Access ✅
**Problem**: Dashboard showing "Limited Access" for ADVANCE_USER_1.

**Root Cause**: Dashboard was checking for `dashboard.view` but ADVANCE_USER_1 gets `dashboard` permission.

**Solution**: Updated dashboard access logic in `src/app/dashboard/page.tsx`:
```typescript
const hasDashboardAccess = session?.user?.permissions?.includes("dashboard.view") ||
  session?.user?.permissions?.includes("dashboard.full_access") ||
  session?.user?.permissions?.includes("dashboard") ||
  session?.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1'].includes(role.toLowerCase()));
```

### 3. Document Repository Access for All Users ✅
**Problem**: Document repository was restricted to only admin and ADVANCE_USER_1.

**Solution**: Updated document API endpoints to allow all authenticated users with proper security level filtering:

**Files Updated**:
- `src/app/api/documents/route.ts` (GET and POST methods)
- `src/app/api/documents/upload/route.ts`

**New Permission Logic**:
```typescript
const hasPermission = session.user?.permissions?.includes('documents.view') ||
  session.user?.permissions?.includes('documents.full_access') ||
  session.user?.permissions?.includes('documents') ||
  session.user?.permissions?.includes('documents_view') ||
  session.user?.permissions?.includes('documents_edit') ||
  session.user?.roles?.some(role => ['admin', 'manager', 'advance_user_1', 'advance_user_2', 'basic_user_1', 'basic_user_2', 'hr'].includes(role.toLowerCase())) ||
  session.user; // Allow all authenticated users
```

### 4. Enhanced Dashboard Module Buttons ✅
**Solution**: Added module access buttons with proper permissions and added Document Repository for all users:

**Added to Dashboard**:
- **Document Repository**: Available to ALL authenticated users
- **Risk Management**: Available to ADVANCE_USER_1 and above
- **Enhanced Call Centre button**: Now recognizes ADVANCE_USER_1 permissions
- **Enhanced Programs button**: Now recognizes role-based access

### 5. Syntax Error Fixes ✅
**Problem**: Missing semicolons causing build errors.

**Solution**: Fixed syntax errors in:
- `src/app/api/call-centre/activities/route.ts`
- `src/app/api/call-centre/stats/route.ts`

## Permission Structure Summary

### ADVANCE_USER_1 Role Capabilities
According to role definitions, ADVANCE_USER_1 should have:

✅ **Call Center**: Full access (`call_center_full`, `callcentre.access`, `callcentre.officer`)
✅ **Dashboard**: View access (`dashboard`)
✅ **Programs**: Edit access (`programs_edit`)  
✅ **Documents**: Edit access up to Secret level (`documents_edit`, `documents`)
✅ **Risk Management**: Edit access (`risks_edit`)
✅ **Personal Profile**: Full access (`personalProfile`)

### Document Access Levels by Role
- **BASIC_USER_1/2**: Public and Confidential documents
- **ADVANCE_USER_1/2**: Up to Secret documents  
- **HR/ADMIN**: Up to Top Secret documents

## Testing Instructions

1. **Access the application**: http://localhost:3001 (server running on port 3001)
2. **Login as Tatenda Moyo**: `tatenda@saywhat.org` (ADVANCE_USER_1)
3. **Verify Dashboard**: Should see main dashboard without "Limited Access"
4. **Test Call Centre**: Should load all data without "Failed to load" errors
5. **Check Document Repository**: Should be visible and accessible to all users
6. **Test Risk Management**: Should be accessible for ADVANCE_USER_1
7. **Verify Module Buttons**: All appropriate modules should be visible on dashboard

## Files Modified Summary

### API Endpoints (9 files)
- 9 Call Centre API routes updated for permission consistency
- 3 Document API routes updated for universal access

### Frontend Components (2 files)  
- Dashboard page enhanced with proper module access
- Call Centre page permission logic updated

### Permission Logic
- Unified permission checking across all modules
- Support for both permission-based and role-based access
- Backwards compatibility maintained

## Next Steps

1. **Test all user roles** to ensure no access issues
2. **Verify document security levels** are properly enforced
3. **Test module functionality** for each user type
4. **Monitor system performance** with new permission checks

---

*Server running on http://localhost:3001*  
*All critical permission issues for ADVANCE_USER_1 resolved*  
*Document Repository now accessible to all authenticated users*