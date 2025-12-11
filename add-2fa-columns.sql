-- Add 2FA (Two-Factor Authentication) columns to users table
-- Run this SQL script in Supabase SQL Editor
-- This adds the missing columns that Prisma expects

-- Check current columns (for reference)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name LIKE '%twoFactor%';

-- Add 2FA columns if they don't exist
DO $$ 
BEGIN
    -- Add twoFactorEnabled column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twoFactorEnabled'
    ) THEN
        ALTER TABLE users ADD COLUMN "twoFactorEnabled" BOOLEAN DEFAULT false;
    END IF;

    -- Add twoFactorSecret column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twoFactorSecret'
    ) THEN
        ALTER TABLE users ADD COLUMN "twoFactorSecret" TEXT;
    END IF;

    -- Add twoFactorSecretTemp column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twoFactorSecretTemp'
    ) THEN
        ALTER TABLE users ADD COLUMN "twoFactorSecretTemp" TEXT;
    END IF;

    -- Add twoFactorBackupCodes column (as TEXT array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twoFactorBackupCodes'
    ) THEN
        ALTER TABLE users ADD COLUMN "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('twoFactorEnabled', 'twoFactorSecret', 'twoFactorSecretTemp', 'twoFactorBackupCodes')
ORDER BY column_name;

-- Update existing users to have default values
UPDATE users
SET 
    "twoFactorEnabled" = COALESCE("twoFactorEnabled", false),
    "twoFactorBackupCodes" = COALESCE("twoFactorBackupCodes", ARRAY[]::TEXT[])
WHERE "twoFactorEnabled" IS NULL OR "twoFactorBackupCodes" IS NULL;

