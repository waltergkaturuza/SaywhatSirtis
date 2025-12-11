-- Update admin email from admin@saywhat.org.zw to sirtis@saywhat.org.zw
-- Run this SQL script in Supabase SQL Editor

-- First, check current admin user
SELECT 
  id, 
  email, 
  "firstName", 
  "lastName", 
  role, 
  roles, 
  "isActive",
  "updatedAt"
FROM "public"."users"
WHERE email = 'admin@saywhat.org.zw' OR email = 'sirtis@saywhat.org.zw';

-- Update admin email
UPDATE "public"."users"
SET
  email = 'sirtis@saywhat.org.zw',
  "updatedAt" = NOW()
WHERE email = 'admin@saywhat.org.zw';

-- Verify the update
SELECT 
  id, 
  email, 
  "firstName", 
  "lastName", 
  role, 
  roles, 
  "isActive",
  "updatedAt"
FROM "public"."users"
WHERE email = 'sirtis@saywhat.org.zw';

