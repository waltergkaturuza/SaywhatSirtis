-- Add missing fields to CallRecord model
-- This extends the call_records table to match frontend form fields

ALTER TABLE call_records ADD COLUMN IF NOT EXISTS caller_age VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS caller_gender VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS caller_province VARCHAR(100);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS caller_address TEXT;
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS caller_key_population VARCHAR(100);

-- Client details (person who needs help - may be different from caller)
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_age VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_gender VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_province VARCHAR(100);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_key_population VARCHAR(100);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_employment_status VARCHAR(100);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS client_education_level VARCHAR(100);

-- Call details
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS communication_mode VARCHAR(100);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS call_language VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS call_validity VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS new_or_repeat_call VARCHAR(50);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS how_heard_about_us VARCHAR(255);

-- Service details
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS voucher_issued BOOLEAN DEFAULT FALSE;
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS voucher_value DECIMAL(10,2);
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS services_recommended TEXT;
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS referral_details TEXT;

-- Call duration and timing
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS call_duration_minutes INTEGER;

-- Additional tracking
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS perpetrator_info TEXT;
ALTER TABLE call_records ADD COLUMN IF NOT EXISTS is_case BOOLEAN DEFAULT FALSE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_records_caller_province ON call_records(caller_province);
CREATE INDEX IF NOT EXISTS idx_call_records_client_province ON call_records(client_province);
CREATE INDEX IF NOT EXISTS idx_call_records_communication_mode ON call_records(communication_mode);
CREATE INDEX IF NOT EXISTS idx_call_records_call_validity ON call_records(call_validity);
CREATE INDEX IF NOT EXISTS idx_call_records_voucher_issued ON call_records(voucher_issued);
