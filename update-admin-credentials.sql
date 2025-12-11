-- Update Admin User Credentials
-- Run this SQL script in Supabase SQL Editor
-- Updates email from admin@saywhat.org to admin@saywhat.org.zw
-- Sets password to @Dm1n_123

-- First, check if the user exists
SELECT id, email, "firstName", "lastName", role, roles, "isActive"
FROM users
WHERE email = 'admin@saywhat.org' OR email = 'admin@saywhat.org.zw';

-- Update the admin user
-- Option 1: If user exists with old email, update it
UPDATE users
SET 
  email = 'admin@saywhat.org.zw',
  "passwordHash" = '$2b$10$k0E4XBSvbJSYETCuxQBaPeseUktoNzWTNQhBoFj./Sk80nzEnfsky',
  "updatedAt" = NOW()
WHERE email = 'admin@saywhat.org';

-- Option 2: If user doesn't exist, create a new admin user
-- Uncomment and run this if the UPDATE above affects 0 rows
/*
INSERT INTO users (
  id,
  email,
  "firstName",
  "lastName",
  role,
  roles,
  department,
  position,
  "isActive",
  "passwordHash",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'admin@saywhat.org.zw',
  'System',
  'Administrator',
  'SYSTEM_ADMINISTRATOR',
  ARRAY['SYSTEM_ADMINISTRATOR']::text[],
  'IT',
  'System Administrator',
  true,
  '$2b$10$k0E4XBSvbJSYETCuxQBaPeseUktoNzWTNQhBoFj./Sk80nzEnfsky',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  "passwordHash" = EXCLUDED."passwordHash",
  "updatedAt" = NOW();
*/

-- Verify the update
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role,
  roles,
  "isActive",
  CASE 
    WHEN "passwordHash" IS NOT NULL THEN 'Password set'
    ELSE 'No password'
  END as password_status,
  "updatedAt"
FROM users
WHERE email = 'admin@saywhat.org.zw';

