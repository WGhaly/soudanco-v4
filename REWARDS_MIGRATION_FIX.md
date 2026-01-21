# Rewards System Database Migration Fix

## Issue
The Rewards page is showing 500 errors because the reward tables (`reward_tiers` and `customer_quarterly_rewards`) don't exist in the production database yet.

## Root Cause
The migration file `0003_add_rewards_system.sql` exists in the `admin-panel/drizzle/` folder but hasn't been applied to the production database. The application doesn't automatically run migrations on startup.

## Solution

### Option 1: Run Migration via Drizzle Kit (Recommended)

1. Install drizzle-kit if not already installed:
```bash
cd admin-panel
pnpm add -D drizzle-kit
```

2. Add migration scripts to package.json:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  }
}
```

3. Run the migration against production:
```bash
# Make sure DATABASE_URL environment variable points to production
export DATABASE_URL="your-production-database-url"

# Then run migration
pnpm db:migrate
```

### Option 2: Manual SQL Execution

Connect to your production PostgreSQL database and run the SQL from the migration file:

**File: `admin-panel/drizzle/0003_add_rewards_system.sql`**

```sql
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
```

### Option 3: Use Vercel CLI

If you're using Vercel for deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
cd admin-panel
vercel link

# Set production environment variable temporarily
vercel env pull .env.production

# Run migration
DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2-) pnpm db:migrate
```

## Verification

After running the migration, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reward_tiers', 'customer_quarterly_rewards');

-- Check table structure
\d reward_tiers
\d customer_quarterly_rewards
```

## After Migration

Once the tables are created, the Rewards page should work correctly. You can:

1. Create reward tiers for different quarters
2. View automatically calculated customer rewards
3. Make manual adjustments to rewards
4. Process rewards to add funds to customer wallets

## Future Prevention

To prevent this issue in the future, consider:

1. **Automatic migrations on startup**: Add migration logic to your server startup
2. **CI/CD pipeline**: Include migration step in your deployment pipeline
3. **Vercel build command**: Update build command to include migrations:
   ```json
   {
     "buildCommand": "pnpm db:migrate && pnpm build"
   }
   ```

## Changes Made

✅ Rewards page now uses full Arabic RTL layout
✅ Sidebar navigation properly integrated (no longer hidden)
✅ Improved API error logging for debugging
✅ Better loading indicators with spinner icons
✅ Proper styling consistent with other admin pages

All UI changes have been committed and pushed to GitHub. Once the database migration is applied, the Rewards system will be fully functional.
