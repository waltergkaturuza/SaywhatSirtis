-- Normalize legacy caller age band and split combined purpose for reporting.
UPDATE "call_records" SET "callerAge" = '1-14' WHERE "callerAge" = '-14';
UPDATE "call_records" SET "purpose" = 'Information' WHERE "purpose" = 'Information and Counselling';
