-- Mark migration to add is_deleted column
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT FALSE;
