-- Migration: Add Two-Factor Authentication fields to users table
-- This migration adds 2FA support fields to the users table
-- Run this manually if prisma db push fails due to other schema conflicts

-- Add twoFactorSecret field (nullable)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;

-- Add twoFactorBackupCodes field (array of strings, default empty array)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[] DEFAULT '{}';

-- Add twoFactorEnabled field (boolean, default false)
-- Note: twoFactorEnabled already exists in schema, but ensuring it's set correctly
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false;

-- Create index on twoFactorEnabled for faster queries
CREATE INDEX IF NOT EXISTS "idx_users_two_factor_enabled" ON users("twoFactorEnabled");

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('twoFactorSecret', 'twoFactorBackupCodes', 'twoFactorEnabled');

