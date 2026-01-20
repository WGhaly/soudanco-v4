# Quarterly Rewards System - Implementation Summary

## Overview
Implemented a comprehensive quarterly rewards system for Soudanco V4 that allows admins to:
1. Configure reward tiers for each quarter with flexible carton thresholds
2. Track customer purchases by cartons per quarter
3. Automatically calculate rewards based on tier eligibility
4. Manually adjust rewards before processing
5. Process all rewards with a single action to add to customer wallets
6. Tag payments as 'user_topup', 'cash_payment', or 'reward'

## Database Schema Changes

### New Enums
- `payment_type`: ['user_topup', 'cash_payment', 'reward']
- `reward_status`: ['pending', 'processed', 'cancelled']

### Modified Tables
**payments** - Added new field:
- `type`: paymentTypeEnum (default: 'user_topup')

### New Tables

**reward_tiers**
- `id`: uuid (PK)
- `name`: varchar(255) - Tier name in English
- `nameAr`: varchar(255) - Tier name in Arabic
- `quarter`: integer (1-4)
- `year`: integer (e.g., 2024)
- `minCartons`: integer - Minimum cartons to qualify
- `maxCartons`: integer (nullable) - Maximum cartons for this tier
- `cashbackPerCarton`: decimal(10,2) - Reward amount per carton
- `isActive`: boolean (default: true)
- `createdAt`: timestamp
- `updatedAt`: timestamp

**customer_quarterly_rewards**
- `id`: uuid (PK)
- `customerId`: uuid (FK to customers)
- `quarter`: integer (1-4)
- `year`: integer
- `totalCartonsPurchased`: integer - Auto-calculated from delivered orders
- `eligibleTierId`: uuid (FK to reward_tiers, nullable)
- `calculatedReward`: decimal(12,2) - Auto-calculated (cartons × cashback)
- `manualAdjustment`: decimal(12,2) - Admin can add/subtract amount
- `finalReward`: decimal(12,2) - calculatedReward + manualAdjustment
- `status`: rewardStatusEnum (default: 'pending')
- `paymentId`: uuid (FK to payments) - Created when processed
- `processedAt`: timestamp - When rewards were distributed
- `processedBy`: uuid (FK to users) - Admin who processed
- `notes`: text - Reason for adjustments
- `createdAt`: timestamp
- `updatedAt`: timestamp

## Backend Implementation

### New Routes

**Reward Tiers API** (`/api/reward-tiers`)
- `GET /` - List all tiers (filterable by quarter and year)
- `GET /:id` - Get specific tier
- `POST /` - Create new tier
- `PUT /:id` - Update tier
- `DELETE /:id` - Delete tier

**Customer Rewards API** (`/api/customer-rewards`)
- `GET /` - Get/calculate rewards for all customers in a quarter
  - Auto-calculates cartons from delivered orders
  - Finds eligible tier based on cartons
  - Creates/updates reward records
- `PUT /:id` - Update manual adjustment and notes
- `POST /process` - Process all pending rewards for a quarter
  - Creates payment records with type='reward'
  - Updates customer wallet balances
  - Marks rewards as processed
  - Atomic transaction for each customer
- `GET /customer/:customerId` - Get all rewards for a customer

### Utility Functions (`server/utils/quarters.ts`)
- `getQuarterFromDate(date)` - Returns quarter number (1-4)
- `getCurrentQuarter()` - Returns current quarter info
- `getQuarterDateRange(quarter, year)` - Returns start and end dates
- `getYearQuarters(year)` - Returns all 4 quarters for a year
- `formatQuarterLabel(quarter, year)` - e.g., "Q1 2024"
- `formatQuarterLabelAr(quarter, year)` - e.g., "الربع الأول 2024"
- `getPreviousQuarter()`, `getNextQuarter()` - Navigation helpers
- `isDateInQuarter()` - Check if date falls in quarter

### Carton Calculation Logic
```sql
SELECT COALESCE(SUM(order_items.quantity), 0) as totalCartons
FROM order_items
INNER JOIN orders ON order_items.order_id = orders.id
WHERE orders.customer_id = {customerId}
  AND orders.status = 'delivered'
  AND orders.created_at >= {quarterStartDate}
  AND orders.created_at <= {quarterEndDate}
```

### Tier Eligibility Logic
1. Fetch all active tiers for the quarter/year
2. Sort by minCartons descending
3. Find first tier where:
   - `cartons >= tier.minCartons`
   - `cartons <= tier.maxCartons` (or maxCartons is null)

## Frontend Implementation

### New Page: Rewards.tsx
Located at: `/admin-panel/client/pages/Rewards.tsx`

**Features:**
- Year selector (previous year, current year, next year)
- Quarterly tabs (Q1, Q2, Q3, Q4)
- Two main sections per quarter:
  1. **Reward Tiers Management**
     - Table showing all configured tiers
     - Add/Edit/Delete tier functionality
     - Shows min/max cartons and cashback amounts
     - Active/Inactive status badges
  
  2. **Customer Rewards Table**
     - Lists all customers with their quarterly data
     - Shows: cartons purchased, eligible tier, calculated reward
     - Manual adjustment column (can be positive or negative)
     - Final reward (calculated + adjustment)
     - Status badges (pending/processed/cancelled)
     - Edit button to adjust individual rewards
     - "Process All Rewards" button for pending rewards

**Dialogs:**
1. **Tier Dialog** - Create/Edit reward tiers
   - Name (English/Arabic)
   - Min/Max cartons
   - Cashback per carton
   
2. **Adjustment Dialog** - Modify customer rewards
   - Shows calculated reward
   - Input for manual adjustment
   - Shows final reward preview
   - Notes field for justification
   
3. **Process Confirmation Dialog** - Confirm bulk processing
   - Shows number of customers
   - Shows total amount to distribute
   - Warning that action cannot be undone

### Navigation
- Added "المكافآت" (Rewards) menu item in Sidebar
- Route: `/rewards`
- Icon: Star/Award icon

## Workflow

### 1. Configuration Phase (Admin)
```
1. Navigate to Rewards page
2. Select year and quarter
3. Add reward tiers:
   - Bronze: 100-299 cartons → 2 EGP/carton
   - Silver: 300-599 cartons → 3 EGP/carton
   - Gold: 600+ cartons → 5 EGP/carton
```

### 2. Tracking Phase (Automatic)
```
- System tracks all delivered orders
- Counts total cartons per customer per quarter
- Updates customer_quarterly_rewards table automatically when admin views the page
```

### 3. Review Phase (Admin)
```
1. At end of quarter, admin opens Rewards page
2. Reviews customer rewards table
3. System shows:
   - Customer A: 450 cartons → Silver tier → 1,350 EGP
   - Customer B: 150 cartons → Bronze tier → 300 EGP
   - Customer C: 50 cartons → No tier → 0 EGP
4. Admin can manually adjust:
   - Customer A: +150 EGP (bonus for loyalty) → Final: 1,500 EGP
   - Customer B: -50 EGP (quality issues) → Final: 250 EGP
```

### 4. Processing Phase (Admin)
```
1. Admin clicks "Process All Rewards"
2. Confirmation dialog shows:
   - 2 customers will receive rewards
   - Total: 1,750 EGP
3. Admin confirms
4. System:
   - Creates payment records (type='reward')
   - Updates customer wallet balances
   - Marks rewards as processed
   - Records admin ID and timestamp
5. Customers see increased wallet balance
```

## Payment Type System

### Types
1. **user_topup** - Customer adds funds via app
2. **cash_payment** - Admin adds cash payment (future feature)
3. **reward** - System reward from quarterly program

### Usage in Rewards
When rewards are processed, payment records are created with:
```typescript
{
  paymentNumber: "RWD-{timestamp}-{customerId}",
  customerId: customerId,
  amount: finalReward,
  method: 'credit',
  type: 'reward',  // ← Payment type tag
  status: 'completed',
  reference: "Q1 2024 Reward",
  notes: "Quarterly reward for 1/2024",
  processedAt: now
}
```

## Migration Status
- Migration file created: `0000_quick_doctor_strange.sql`
- **Not yet applied** - Database needs to be running
- To apply: `pnpm drizzle-kit push` (requires Docker/PostgreSQL)

## Files Created/Modified

### Backend
- ✅ `admin-panel/server/db/schema.ts` - Added enums and tables
- ✅ `admin-panel/server/utils/quarters.ts` - Quarter helper functions
- ✅ `admin-panel/server/routes/reward-tiers.ts` - Tier CRUD operations
- ✅ `admin-panel/server/routes/customer-rewards.ts` - Rewards calculation and processing
- ✅ `admin-panel/server/index.ts` - Registered new routes
- ✅ `admin-panel/drizzle/0000_quick_doctor_strange.sql` - Migration file

### Frontend
- ✅ `admin-panel/client/pages/Rewards.tsx` - Main rewards page
- ✅ `admin-panel/client/App.tsx` - Added route
- ✅ `admin-panel/client/components/Sidebar.tsx` - Added menu item

## Next Steps

### Immediate (To Complete Rewards System)
1. Start PostgreSQL database: `docker-compose up -d`
2. Apply migration: `cd admin-panel && pnpm drizzle-kit push`
3. Test the rewards system
4. Deploy to Vercel (will use production database)

### Related Features (As Designed)
1. **Cash Payment in Customer Credit Page**
   - Add "Add Cash Payment" button to CustomerDetails.tsx
   - Create modal for entering amount and notes
   - Tag payment as 'cash_payment' type
   - Update customer wallet balance

2. **Payment Display with Type Badges**
   - Update PaymentsTable.tsx to show payment type
   - Add colored badges:
     - 'user_topup' → Blue badge
     - 'cash_payment' → Green badge
     - 'reward' → Purple/Gold badge

## Testing Checklist

### Tier Management
- [ ] Create tier with min/max cartons
- [ ] Create tier with no max (unlimited)
- [ ] Edit existing tier
- [ ] Delete tier
- [ ] Toggle tier active/inactive

### Reward Calculation
- [ ] Customer with 0 cartons shows "No tier"
- [ ] Customer qualifies for correct tier based on cartons
- [ ] Calculated reward = cartons × cashback
- [ ] Manual adjustment adds/subtracts correctly
- [ ] Final reward = calculated + adjustment

### Reward Processing
- [ ] Process creates payment records
- [ ] Wallet balances update correctly
- [ ] Status changes to 'processed'
- [ ] Cannot process already-processed rewards
- [ ] Cannot edit processed rewards
- [ ] Admin ID recorded in processedBy

### Edge Cases
- [ ] No tiers configured - shows message
- [ ] No customers with purchases - shows empty
- [ ] Negative adjustment makes final reward negative - should work
- [ ] Process with 0 final reward - skips customer
- [ ] Multiple tiers overlap - uses highest qualifying tier

## API Endpoints Summary

```
POST   /api/reward-tiers              Create tier
GET    /api/reward-tiers              List tiers (filter by q/y)
GET    /api/reward-tiers/:id          Get tier
PUT    /api/reward-tiers/:id          Update tier
DELETE /api/reward-tiers/:id          Delete tier

GET    /api/customer-rewards          Get/calculate all customer rewards (q/y)
PUT    /api/customer-rewards/:id      Update adjustment
POST   /api/customer-rewards/process  Process all pending rewards
GET    /api/customer-rewards/customer/:customerId  Get customer history
```

## Security & Permissions
- All routes protected with `authMiddleware`
- Only admin/supervisor roles can access
- Processing records admin user ID for audit trail
- Cannot modify processed rewards
- Confirmation dialog prevents accidental processing

## Future Enhancements (Out of Scope)
- Email notifications when rewards are processed
- Export rewards report to Excel/PDF
- Reward history/analytics dashboard
- Automatic tier suggestions based on purchase patterns
- Multi-tier qualification (e.g., bonus if in Gold for 2 consecutive quarters)
