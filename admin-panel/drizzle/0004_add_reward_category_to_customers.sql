-- Add reward_category column to customers table
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "reward_category" varchar(50);
