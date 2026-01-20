# Production Database Migration Guide

## Rewards System Migration - January 20, 2026

### Migration Applied Locally ✅
- Local database (localhost:5433) has been successfully migrated
- Migration file: `admin-panel/drizzle/0003_add_rewards_system.sql`

### Production Deployment Status ✅
- **Admin Panel**: https://admin-panel-sigma-navy.vercel.app
- **User App**: https://user-app-wine.vercel.app
- Both applications deployed successfully

### Production Database Migration Required

To apply the rewards system migration to your production database, you have two options:

#### Option 1: Using Vercel Environment Variables (Recommended)

1. **Get your production DATABASE_URL**:
   ```bash
   # In Vercel dashboard or via CLI
   vercel env pull --environment production
   ```

2. **Apply migration using environment variable**:
   ```bash
   cd admin-panel
   # Set the production DATABASE_URL temporarily
   export DATABASE_URL="your-production-database-url"
   
   # Run the migration SQL file
   psql $DATABASE_URL -f drizzle/0003_add_rewards_system.sql
   ```

#### Option 2: Direct Database Access

If you have direct access to your production PostgreSQL database:

```bash
cd admin-panel

# Connect and run the migration
psql -h your-prod-host -p 5432 -U your-user -d your-database -f drizzle/0003_add_rewards_system.sql
```

#### Option 3: Through Database Management Tool

Copy the contents of `admin-panel/drizzle/0003_add_rewards_system.sql` and execute it in your database management tool (pgAdmin, DBeaver, Supabase SQL Editor, etc.)

### Migration Contents

The migration adds:
- ✅ `payment_type` enum (user_topup, cash_payment, reward)
- ✅ `reward_status` enum (pending, processed, cancelled)
- ✅ `type` column to `payments` table
- ✅ `reward_tiers` table
- ✅ `customer_quarterly_rewards` table
- ✅ All necessary foreign key constraints

### Verification

After applying the migration, verify it was successful:

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE tablename IN ('reward_tiers', 'customer_quarterly_rewards');

-- Check if payment type enum exists
SELECT typname FROM pg_type WHERE typname = 'payment_type';

-- Check if payments.type column exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'type';
```

Expected output:
```
tablename              
----------------------------
reward_tiers
customer_quarterly_rewards

typname
-------------
payment_type

column_name | data_type
------------+-----------
type        | USER-DEFINED
```

### Post-Migration Testing

1. **Access Admin Panel**: https://admin-panel-sigma-navy.vercel.app
2. **Login as Admin**
3. **Navigate to Rewards** (المكافآت menu item)
4. **Test Tier Creation**:
   - Select Q1 2026 (current quarter)
   - Click "Add Tier"
   - Create a test tier (e.g., Bronze: 100-299 cartons, 2 EGP/carton)
   - Save and verify it appears in the table

5. **Test Customer Rewards**:
   - The customer rewards table should load (may be empty if no delivered orders yet)
   - Try manual adjustment on any customer
   - Verify the calculation: Final Reward = Calculated + Adjustment

### Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop the new tables
DROP TABLE IF EXISTS customer_quarterly_rewards CASCADE;
DROP TABLE IF EXISTS reward_tiers CASCADE;

-- Remove the payment type column
ALTER TABLE payments DROP COLUMN IF EXISTS type;

-- Drop the new enums
DROP TYPE IF EXISTS reward_status;
DROP TYPE IF EXISTS payment_type;
```

### Important Notes

⚠️ **Backward Compatibility**: The migration is designed to be backward compatible:
- Uses `IF NOT EXISTS` for table creation
- Uses `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` for enum creation
- Adds column with default value so existing rows work

✅ **Safe to Run Multiple Times**: The migration script can be run multiple times without errors

🔒 **Data Safety**: No data loss - only adds new tables and columns

### Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check database connection in Vercel environment variables
3. Verify DATABASE_URL is set correctly in production
4. Check PostgreSQL version (should be 12+)

### Next Steps

After successful migration:
1. ✅ Rewards system is fully functional
2. ✅ Admin can configure quarterly tiers
3. ✅ System tracks customer carton purchases
4. ✅ Admin can process rewards and distribute to wallets

For detailed system documentation, see: [REWARDS_SYSTEM.md](./REWARDS_SYSTEM.md)
