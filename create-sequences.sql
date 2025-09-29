-- SQL to create a sequences table for systematic numbering
-- Run this in your PostgreSQL database

CREATE TABLE IF NOT EXISTS sequences (
  id VARCHAR(50) PRIMARY KEY,
  current_value BIGINT NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for year-based sequences
CREATE UNIQUE INDEX IF NOT EXISTS idx_sequences_id_year ON sequences(id, year);

-- Insert initial sequences for current year
INSERT INTO sequences (id, current_value, year) 
VALUES 
  ('case_number', 0, EXTRACT(YEAR FROM CURRENT_DATE)),
  ('call_number', 0, EXTRACT(YEAR FROM CURRENT_DATE))
ON CONFLICT (id, year) DO NOTHING;

-- Function to get next case number
CREATE OR REPLACE FUNCTION get_next_case_number(target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
  formatted_number TEXT;
BEGIN
  -- Insert sequence record if it doesn't exist
  INSERT INTO sequences (id, current_value, year)
  VALUES ('case_number', 0, target_year)
  ON CONFLICT (id, year) DO NOTHING;
  
  -- Atomically increment and get next value
  UPDATE sequences 
  SET current_value = current_value + 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = 'case_number' AND year = target_year
  RETURNING current_value INTO next_val;
  
  -- Format as 8-digit number
  formatted_number := LPAD(next_val::TEXT, 8, '0');
  
  RETURN 'CASE-' || target_year || '-' || formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to get next call number
CREATE OR REPLACE FUNCTION get_next_call_number(target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
  formatted_number TEXT;
BEGIN
  -- Insert sequence record if it doesn't exist
  INSERT INTO sequences (id, current_value, year)
  VALUES ('call_number', 0, target_year)
  ON CONFLICT (id, year) DO NOTHING;
  
  -- Atomically increment and get next value
  UPDATE sequences 
  SET current_value = current_value + 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = 'call_number' AND year = target_year
  RETURNING current_value INTO next_val;
  
  -- Format as 7-digit number
  formatted_number := LPAD(next_val::TEXT, 7, '0');
  
  RETURN formatted_number || '/' || target_year;
END;
$$ LANGUAGE plpgsql;