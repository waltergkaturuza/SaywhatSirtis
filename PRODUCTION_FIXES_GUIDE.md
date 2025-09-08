# SIRTIS Production Deployment Fix Guide

## Issues Identified from Production Errors:

### 1. Authentication Issues (401 Unauthorized)
**Problem**: NextAuth callback failing  
**Cause**: Missing environment variables in production

**Fix**:
1. Go to your Render dashboard
2. Navigate to your SIRTIS web service
3. Go to "Environment" tab
4. Add these variables:

```bash
NEXTAUTH_SECRET=generate-a-32-character-random-string-here
NEXTAUTH_URL=https://sirtis-saywhat.onrender.com
DATABASE_URL=your-postgresql-connection-string
```

**Generate NEXTAUTH_SECRET**:
```bash
# Run this in terminal to generate a secure secret:
openssl rand -base64 32
```

### 2. Missing Routes (404 Not Found)
**Problem**: Missing HR route pages  
**Cause**: Routes not deployed or not created

**Fix**: ✅ **COMPLETED**
- Created `/hr/reports` page
- Created `/hr/employees/reports` page  
- Created `/hr/employees/bulk-import` page
- Created API endpoint `/api/hr/employees/bulk-import`

### 3. API Permission Issues (403 Forbidden)
**Problem**: API returning 403 even after authentication  
**Cause**: Session permissions not being passed correctly in production

**Fix**: ✅ **COMPLETED**
- Updated auth configuration to include `secret` property
- Enhanced error handling in API endpoints
- Added proper session validation

## Deployment Steps:

### Step 1: Environment Variables
Add these to your Render environment:

```bash
# Required
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://sirtis-saywhat.onrender.com
DATABASE_URL=postgresql://user:pass@host:port/database

# Optional (if using these features)
OPENAI_API_KEY=your-openai-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

### Step 2: Database Setup
Make sure your PostgreSQL database is accessible and the DATABASE_URL is correct.

### Step 3: Redeploy
After adding environment variables, trigger a new deployment on Render.

### Step 4: Test Authentication
1. Visit: `https://sirtis-saywhat.onrender.com/auth/test`
2. Login with: `admin@saywhat.org` / `admin123`
3. Verify session and permissions display correctly

### Step 5: Test HR Dashboard
1. Visit: `https://sirtis-saywhat.onrender.com/hr/dashboard`
2. Should redirect to login if not authenticated
3. After login, should display dashboard with stats

## Login Credentials:

### Admin User:
- Email: `admin@saywhat.org`
- Password: `admin123`
- Has full HR permissions

### HR Manager User:
- Email: `hr@saywhat.org`
- Password: `hr123`
- Has HR-specific permissions

## Troubleshooting:

### If authentication still fails:
1. Check Render logs for detailed error messages
2. Verify NEXTAUTH_SECRET is exactly 32+ characters
3. Ensure NEXTAUTH_URL matches your domain exactly
4. Check DATABASE_URL connection

### If APIs return 403:
1. Clear browser cookies/localStorage
2. Login again to refresh session
3. Check if user has correct permissions in auth.ts

### If routes return 404:
1. Verify all new files are committed to git
2. Check Render deployment logs
3. Ensure build completed successfully

## Files Created/Modified:

### New Pages:
- `src/app/hr/reports/page.tsx`
- `src/app/hr/employees/reports/page.tsx`
- `src/app/hr/employees/bulk-import/page.tsx`

### New APIs:
- `src/app/api/hr/employees/bulk-import/route.ts`

### Modified:
- `src/lib/auth.ts` (added secret property)
- `src/app/hr/dashboard/page.tsx` (enhanced authentication)
- `src/app/api/hr/dashboard/activities/route.ts` (better error handling)
- `src/app/api/hr/dashboard/stats/route.ts` (comprehensive error handling)

## Success Criteria:
✅ Login works without 401 errors  
✅ HR dashboard loads with proper data  
✅ All HR routes return 200 status  
✅ APIs return data when authenticated  
✅ Proper error messages for unauthorized access  

After implementing these fixes, the production deployment should work correctly!
