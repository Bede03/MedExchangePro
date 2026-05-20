-- Add attachment_url column to referrals (record migration)
ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "attachment_url" TEXT;
