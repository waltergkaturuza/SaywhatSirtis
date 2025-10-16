# Database Migration Instructions

## Performance Plans Schema Update (2025-10-16)

### Required Migration

The application now requires additional columns in the `performance_plans` table. Run the following SQL on your production database:

```sql
-- Add new columns to performance_plans table
ALTER TABLE "performance_plans" 
  ADD COLUMN IF NOT EXISTS "planTitle" TEXT DEFAULT 'Annual Plan',
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "workflowStatus" TEXT DEFAULT 'draft';

-- Update existing records to have default values
UPDATE "performance_plans" 
SET "workflowStatus" = 'draft' 
WHERE "workflowStatus" IS NULL;

-- Set planTitle for existing records
UPDATE "performance_plans" 
SET "planTitle" = 'Annual Plan ' || "planYear"::TEXT
WHERE "planTitle" IS NULL OR "planTitle" = '';
```

### How to Run

#### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL above
4. Click "Run"

#### Option 2: Using psql
```bash
psql "postgresql://postgres:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" \
  -f prisma/migrations/add_performance_plans_fields.sql
```

#### Option 3: Using Prisma (if database access is available)
```bash
npx prisma db push
```

### Verification

After running the migration, verify the columns were added:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'performance_plans' 
  AND column_name IN ('planTitle', 'startDate', 'endDate', 'workflowStatus');
```

Expected output should show all 4 columns.

### Rollback (if needed)

If you need to rollback this migration:

```sql
ALTER TABLE "performance_plans" 
  DROP COLUMN IF EXISTS "planTitle",
  DROP COLUMN IF EXISTS "startDate",
  DROP COLUMN IF EXISTS "endDate",
  DROP COLUMN IF EXISTS "workflowStatus";
```

### Impact

- **Breaking**: The application will not work until this migration is applied
- **Data Loss**: No data loss expected
- **Downtime**: Migration should complete in < 1 second for most databases

