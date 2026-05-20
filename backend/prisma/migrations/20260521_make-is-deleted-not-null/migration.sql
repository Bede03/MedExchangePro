-- Ensure is_deleted is NOT NULL with default false
UPDATE "users" SET "is_deleted" = false WHERE "is_deleted" IS NULL;
ALTER TABLE "users" ALTER COLUMN "is_deleted" SET DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "is_deleted" SET NOT NULL;
