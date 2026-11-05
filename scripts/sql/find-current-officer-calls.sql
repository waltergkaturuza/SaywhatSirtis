-- Who saved a call recorded under the placeholder officer "Current Officer"?
-- Read-only. Run in psql, the Neon SQL editor, or any PostgreSQL client.
-- Change the call number in the "target" CTE of each query (default: 0004215/2026).
-- call_records has no "saved by" column, so this collects every trace that can identify the officer.

-- 1. The call itself
SELECT id, "callNumber", "caseNumber", "officerName", "assignedOfficer", "isCase",
       "callStartTime", "createdAt", "updatedAt", "callerPhone", purpose, comment
FROM call_records
WHERE "callNumber" ILIKE '%0004215%';

-- 2. Audit entries that name this call (case history, edits, API logs)
WITH target AS (
  SELECT id, "callNumber", "caseNumber" FROM call_records WHERE "callNumber" ILIKE '%0004215%' LIMIT 1
)
SELECT a."timestamp", a.action, a.resource, a."resourceId", a."userId",
       COALESCE(NULLIF(TRIM(CONCAT(u."firstName", ' ', u."lastName")), ''), u.email) AS user_name,
       a."ipAddress", a.details
FROM audit_logs a
CROSS JOIN target t
LEFT JOIN users u ON u.id = a."userId"
WHERE a."resourceId" = t.id
   OR a.details::text ILIKE '%' || t."callNumber" || '%'
   OR (t."caseNumber" IS NOT NULL AND a.details::text ILIKE '%' || t."caseNumber" || '%')
ORDER BY a."timestamp";

-- 3. Saves to the calls API within 10 minutes of the call being created
WITH target AS (
  SELECT "createdAt" FROM call_records WHERE "callNumber" ILIKE '%0004215%' LIMIT 1
)
SELECT a."timestamp", a.action, a.resource, a."userId",
       COALESCE(NULLIF(TRIM(CONCAT(u."firstName", ' ', u."lastName")), ''), u.email) AS user_name,
       a."ipAddress", a.details
FROM audit_logs a
CROSS JOIN target t
LEFT JOIN users u ON u.id = a."userId"
WHERE a."timestamp" BETWEEN t."createdAt" - INTERVAL '10 minutes' AND t."createdAt" + INTERVAL '10 minutes'
  AND (a.action ILIKE 'API_POST%' OR a.resource ILIKE '%call%' OR a.details::text ILIKE '%call-centre/calls%')
ORDER BY a."timestamp";

-- 4. Every signed-in user active within 30 minutes of the call (logins, page visits, any action)
WITH target AS (
  SELECT "createdAt" FROM call_records WHERE "callNumber" ILIKE '%0004215%' LIMIT 1
)
SELECT a."userId",
       COALESCE(NULLIF(TRIM(CONCAT(u."firstName", ' ', u."lastName")), ''), u.email) AS user_name,
       u.department,
       COUNT(*) AS events,
       MIN(a."timestamp") AS first_event,
       MAX(a."timestamp") AS last_event,
       MIN(ABS(EXTRACT(EPOCH FROM (a."timestamp" - t."createdAt")))) / 60 AS closest_minutes
FROM audit_logs a
CROSS JOIN target t
JOIN users u ON u.id = a."userId"
WHERE a."timestamp" BETWEEN t."createdAt" - INTERVAL '30 minutes' AND t."createdAt" + INTERVAL '30 minutes'
GROUP BY a."userId", u."firstName", u."lastName", u.email, u.department
ORDER BY closest_minutes;

-- 5. People who signed in during the 12 hours before the call and had not signed out by then
--    (uses login and logout events in audit_logs)
WITH target AS (
  SELECT "createdAt" FROM call_records WHERE "callNumber" ILIKE '%0004215%' LIMIT 1
),
last_login AS (
  SELECT a."userId", MAX(a."timestamp") AS signed_in
  FROM audit_logs a
  CROSS JOIN target t
  WHERE a.action = 'USER_LOGIN_SUCCESS'
    AND a."timestamp" BETWEEN t."createdAt" - INTERVAL '12 hours' AND t."createdAt"
  GROUP BY a."userId"
)
SELECT l."userId",
       COALESCE(NULLIF(TRIM(CONCAT(u."firstName", ' ', u."lastName")), ''), u.email) AS user_name,
       u.department, u.position, l.signed_in,
       ROUND(EXTRACT(EPOCH FROM (t."createdAt" - l.signed_in)) / 60) AS minutes_before_call,
       (SELECT a."ipAddress" FROM audit_logs a
         WHERE a."userId" = l."userId" AND a.action = 'USER_LOGIN_SUCCESS' AND a."timestamp" = l.signed_in
         LIMIT 1) AS login_ip
FROM last_login l
CROSS JOIN target t
JOIN users u ON u.id = l."userId"
WHERE NOT EXISTS (
  SELECT 1 FROM audit_logs o
  WHERE o."userId" = l."userId"
    AND o.action = 'USER_LOGOUT'
    AND o."timestamp" BETWEEN l.signed_in AND t."createdAt"
)
ORDER BY minutes_before_call;

-- 6. Calls captured just before and after, with their officers (shows who was on shift)
WITH target AS (
  SELECT "createdAt" FROM call_records WHERE "callNumber" ILIKE '%0004215%' LIMIT 1
)
SELECT c."callNumber", c."officerName", c."assignedOfficer", c."createdAt",
       ROUND(EXTRACT(EPOCH FROM (c."createdAt" - t."createdAt")) / 60) AS minutes_from_target
FROM call_records c
CROSS JOIN target t
WHERE c."createdAt" BETWEEN t."createdAt" - INTERVAL '2 hours' AND t."createdAt" + INTERVAL '2 hours'
ORDER BY c."createdAt";

-- 7. All calls saved as "Current Officer", with the named officer whose call was closest in time
SELECT p."callNumber", p."caseNumber", p."createdAt",
       nearest."officerName" AS likely_officer,
       nearest."callNumber" AS nearest_named_call,
       ROUND(ABS(EXTRACT(EPOCH FROM (nearest."createdAt" - p."createdAt"))) / 60) AS minutes_apart
FROM call_records p
LEFT JOIN LATERAL (
  SELECT c."officerName", c."callNumber", c."createdAt"
  FROM call_records c
  WHERE c.id <> p.id
    AND c."officerName" IS NOT NULL
    AND TRIM(c."officerName") <> ''
    AND c."officerName" NOT ILIKE 'current officer'
  ORDER BY ABS(EXTRACT(EPOCH FROM (c."createdAt" - p."createdAt")))
  LIMIT 1
) nearest ON TRUE
WHERE p."officerName" ILIKE 'current officer'
ORDER BY p."createdAt" DESC;

-- 8. Optional fix, after confirming the officer. Remove the leading "--" to run it.
-- UPDATE call_records
-- SET "officerName" = 'Full Name Of Officer', "updatedAt" = NOW()
-- WHERE "callNumber" = '0004215/2026'
--   AND "officerName" ILIKE 'current officer';
