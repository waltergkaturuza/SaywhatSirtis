# Production Database Migration Guide

## 🚨 CRITICAL: Database Schema Update Required

Your production deployment is failing because the database schema needs to be updated with new employee management fields.

## 📋 Issue Summary

The enhanced employee management features require additional database columns that don't exist in production:

- `supervisor_id` - Employee supervisor relationships
- `is_supervisor` - Supervisor role flag
- `is_reviewer` - Reviewer role flag  
- `medical_aid` - Medical aid benefit
- `funeral_cover` - Funeral cover benefit
- `vehicle_benefit` - Vehicle benefit
- `fuel_allowance` - Fuel allowance benefit
- `airtime_allowance` - Airtime allowance benefit
- `other_benefits` - Additional benefits array
- `archived_at` - Archive timestamp
- `archive_reason` - Archive reason
- `access_revoked` - Access revocation flag

## 🔧 Migration Solutions

### Option 1: Automated Migration API (Recommended)

1. **Deploy the current code** (includes migration scripts)
2. **Login as admin** to your production site
3. **Navigate to** `/api/admin/migrate` endpoint
4. **Run POST request** to execute migration

```bash
# Check migration status
curl -X GET https://your-domain.com/api/admin/migrate

# Run migration (admin authenticated session required)
curl -X POST https://your-domain.com/api/admin/migrate
```

### Option 2: Manual Database Migration

If you have direct database access, run this SQL:

```sql
-- Add supervisor hierarchy fields
ALTER TABLE employees ADD COLUMN supervisor_id TEXT REFERENCES employees(id);
ALTER TABLE employees ADD COLUMN is_supervisor BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employees ADD COLUMN is_reviewer BOOLEAN NOT NULL DEFAULT false;

-- Add benefits fields
ALTER TABLE employees ADD COLUMN medical_aid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employees ADD COLUMN funeral_cover BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employees ADD COLUMN vehicle_benefit BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employees ADD COLUMN fuel_allowance BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employees ADD COLUMN airtime_allowance BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE employees ADD COLUMN other_benefits TEXT[] DEFAULT '{}';

-- Add archive fields
ALTER TABLE employees ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE employees ADD COLUMN archive_reason TEXT;
ALTER TABLE employees ADD COLUMN access_revoked BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_supervisor_id ON employees(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_employees_is_supervisor ON employees(is_supervisor);
```

### Option 3: Node.js Migration Script

Run this in your production environment:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the migration script
node scripts/production-migration.js
```

## 🔍 Verification Steps

After migration, verify these work:

1. **Employee Archive/Restore** - Should work without errors
2. **Supervisor Assignment** - Can assign supervisors to employees
3. **Benefits Management** - Can update employee benefits
4. **Dashboard Activities** - Should load without database errors

## 🚀 Post-Migration Features

Once migrated, you'll have access to:

- ✅ Enhanced employee hierarchy with supervisor relationships
- ✅ Comprehensive benefits tracking system
- ✅ Data-preserving archive/restore functionality
- ✅ Advanced role management (supervisors, reviewers)
- ✅ Audit trails for all employee operations

## 🆘 Troubleshooting

### If Migration Fails:

1. **Check database permissions** - Ensure ALTER TABLE privileges
2. **Verify connection** - Database connectivity and credentials
3. **Check logs** - Look for specific error messages
4. **Rollback if needed** - Drop added columns if partial failure

### Emergency Rollback:

```sql
-- Only if migration partially fails
ALTER TABLE employees DROP COLUMN IF EXISTS supervisor_id;
ALTER TABLE employees DROP COLUMN IF EXISTS is_supervisor;
-- ... (drop other added columns)
```

## 📞 Support

If migration fails:

1. Check Render/Supabase logs for specific errors
2. Ensure database user has DDL permissions
3. Try manual SQL approach if automated fails
4. Contact your database administrator if needed

## 🎯 Expected Outcome

After successful migration:
- ✅ All API routes work without column errors
- ✅ Employee management features fully functional  
- ✅ Archive/restore operations working
- ✅ Supervisor hierarchy operational
- ✅ Benefits tracking available

---

**⚠️ IMPORTANT:** Always backup your database before running migrations in production!
