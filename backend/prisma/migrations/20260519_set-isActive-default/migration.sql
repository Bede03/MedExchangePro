BEGIN;

-- Set existing NULL is_active values to false
UPDATE "users" SET "is_active" = false WHERE "is_active" IS NULL;

-- Set default for future inserts
ALTER TABLE "users" ALTER COLUMN "is_active" SET DEFAULT false;

COMMIT;
