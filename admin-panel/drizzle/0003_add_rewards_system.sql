-- Add new payment type enum
DO $$ BEGIN
  CREATE TYPE "public"."payment_type" AS ENUM('user_topup', 'cash_payment', 'reward');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new reward status enum
DO $$ BEGIN
  CREATE TYPE "public"."reward_status" AS ENUM('pending', 'processed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add type column to payments table if it doesn't exist
DO $$ BEGIN
  ALTER TABLE "payments" ADD COLUMN "type" "payment_type" DEFAULT 'user_topup' NOT NULL;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Create reward_tiers table
CREATE TABLE IF NOT EXISTS "reward_tiers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "name_ar" varchar(255),
  "quarter" integer NOT NULL,
  "year" integer NOT NULL,
  "min_cartons" integer NOT NULL,
  "max_cartons" integer,
  "cashback_per_carton" numeric(10, 2) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create customer_quarterly_rewards table
CREATE TABLE IF NOT EXISTS "customer_quarterly_rewards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "quarter" integer NOT NULL,
  "year" integer NOT NULL,
  "total_cartons_purchased" integer DEFAULT 0 NOT NULL,
  "eligible_tier_id" uuid,
  "calculated_reward" numeric(12, 2) DEFAULT '0' NOT NULL,
  "manual_adjustment" numeric(12, 2) DEFAULT '0',
  "final_reward" numeric(12, 2) DEFAULT '0' NOT NULL,
  "status" "reward_status" DEFAULT 'pending' NOT NULL,
  "payment_id" uuid,
  "processed_at" timestamp,
  "processed_by" uuid,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys for customer_quarterly_rewards if they don't exist
DO $$ BEGIN
  ALTER TABLE "customer_quarterly_rewards" ADD CONSTRAINT "customer_quarterly_rewards_customer_id_customers_id_fk" 
    FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "customer_quarterly_rewards" ADD CONSTRAINT "customer_quarterly_rewards_eligible_tier_id_reward_tiers_id_fk" 
    FOREIGN KEY ("eligible_tier_id") REFERENCES "public"."reward_tiers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "customer_quarterly_rewards" ADD CONSTRAINT "customer_quarterly_rewards_payment_id_payments_id_fk" 
    FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "customer_quarterly_rewards" ADD CONSTRAINT "customer_quarterly_rewards_processed_by_users_id_fk" 
    FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
