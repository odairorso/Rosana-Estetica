-- Fix financial_transactions reference_id type to allow non-UUID IDs
BEGIN;

-- 1. Drop any foreign key constraints on reference_id if they exist
-- (We'll check for common names, but usually reference_id is polymorphic and has no FK)
-- If there are specific FKs, they would likely be to specific tables.
-- Since we are changing the type, we should be careful.

-- 2. Change the column type to TEXT
ALTER TABLE financial_transactions 
ALTER COLUMN reference_id TYPE TEXT;

COMMIT;
