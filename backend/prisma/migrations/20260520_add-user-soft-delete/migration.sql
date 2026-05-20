-- Drop this file into the Prisma migration folder for the soft delete update.
ALTER TABLE "users"
ADD COLUMN "deleted_at" TIMESTAMP NULL;
