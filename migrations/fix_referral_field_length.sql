-- Migration to fix referral field character limit issue
-- This updates the referral and comment fields to TEXT type for unlimited length

BEGIN;

-- Update referral field to TEXT type
ALTER TABLE call_records ALTER COLUMN referral TYPE TEXT;

-- Update comment field to TEXT type (if not already)
ALTER TABLE call_records ALTER COLUMN comment TYPE TEXT;

-- Update other text fields that might have length issues
ALTER TABLE call_records ALTER COLUMN call_description TYPE TEXT;
ALTER TABLE call_records ALTER COLUMN description TYPE TEXT;
ALTER TABLE call_records ALTER COLUMN summary TYPE TEXT;
ALTER TABLE call_records ALTER COLUMN notes TYPE TEXT;
ALTER TABLE call_records ALTER COLUMN resolution TYPE TEXT;

-- Add index on referral field for better performance (on first 100 chars)
CREATE INDEX IF NOT EXISTS idx_call_records_referral_prefix ON call_records USING btree (substring(referral, 1, 100));

COMMIT;