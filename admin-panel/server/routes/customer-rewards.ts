import { Router, Request } from 'express';
import { db } from '../db';
import { customerQuarterlyRewards, customers, orders, orderItems, rewardTiers, payments, users } from '../db/schema';
import { eq, and, gte, lte, sql, desc, asc, ilike } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { getQuarterDateRange } from '../utils/quarters';

// Extend Express Request to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * Calculate total cartons purchased by a customer in a quarter
 */
async function calculateCustomerCartons(customerId: string, quarter: number, year: number): Promise<number> {
  const { startDate, endDate } = getQuarterDateRange(quarter, year);
  
  // Sum up all order items quantities for delivered orders in the quarter
  const result = await db
    .select({
      totalCartons: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`.as('totalCartons'),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.customerId, customerId),
        eq(orders.status, 'delivered'),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      )
    );
  
  return result[0]?.totalCartons || 0;
}

/**
 * Find the eligible tier for a customer based on cartons purchased and reward category
 */
async function findEligibleTier(cartons: number, quarter: number, year: number, customerCategory: string | null) {
  // If customer has no category, they don't qualify for any tier
  if (!customerCategory) {
    console.log('No customer category provided');
    return null;
  }
  
  console.log(`Finding tier for category: ${customerCategory}, cartons: ${cartons}, Q${quarter}/${year}`);
  
  // Use a more reliable case-insensitive comparison
  const allTiers = await db
    .select()
    .from(rewardTiers)
    .where(
      and(
        eq(rewardTiers.quarter, quarter),
        eq(rewardTiers.year, year),
        eq(rewardTiers.isActive, true)
      )
    );
  
  console.log(`All active tiers for Q${quarter}/${year}:`, allTiers.map(t => ({ name: t.name, min: t.minCartons, max: t.maxCartons })));
  
  // Filter by category name (case-insensitive) in JavaScript
  const tiers = allTiers
    .filter(t => t.name?.toLowerCase().trim() === customerCategory.toLowerCase().trim())
    .sort((a, b) => b.minCartons - a.minCartons);
  
  console.log(`Found ${tiers.length} matching tiers for category "${customerCategory}":`, tiers.map(t => ({ name: t.name, min: t.minCartons, max: t.maxCartons, cashback: t.cashbackPerCarton })));
  
  // Find the tier where cartons >= minCartons and cartons <= maxCartons (or maxCartons is null)
  for (const tier of tiers) {
    if (cartons >= tier.minCartons) {
      if (tier.maxCartons === null || cartons <= tier.maxCartons) {
        console.log(`Matched tier: ${tier.name}, cashback: ${tier.cashbackPerCarton}`);
        return tier;
      }
    }
  }
  
  console.log('No matching tier found for carton count');
  return null;
}

/**
 * GET /api/customer-rewards
 * Get customer rewards for a specific quarter
 */
router.get('/', async (req, res) => {
  try {
    const { quarter, year } = req.query;
    
    if (!quarter || !year) {
      return res.status(400).json({ error: 'Quarter and year are required' });
    }
    
    const q = parseInt(quarter as string);
    const y = parseInt(year as string);
    
    // Get all active customers
    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.isActive, true))
      .orderBy(customers.businessName);
    
    // Get or create rewards records for all customers
    const rewardsData = [];
    
    for (const customer of allCustomers) {
      // Calculate cartons
      const totalCartons = await calculateCustomerCartons(customer.id, q, y);
      
      console.log(`Customer: ${customer.businessName}, Category: ${customer.rewardCategory}, Cartons: ${totalCartons}`);
      
      // Find eligible tier based on customer's reward category
      const eligibleTier = await findEligibleTier(totalCartons, q, y, customer.rewardCategory);
      
      // Calculate reward
      const calculatedReward = eligibleTier
        ? parseFloat(eligibleTier.cashbackPerCarton) * totalCartons
        : 0;
      
      console.log(`Eligible tier: ${eligibleTier?.name || 'none'}, Calculated reward: ${calculatedReward}`);
      
      // Check if record exists
      const [existingReward] = await db
        .select()
        .from(customerQuarterlyRewards)
        .where(
          and(
            eq(customerQuarterlyRewards.customerId, customer.id),
            eq(customerQuarterlyRewards.quarter, q),
            eq(customerQuarterlyRewards.year, y)
          )
        );
      
      if (existingReward) {
        // Update existing record
        const [updated] = await db
          .update(customerQuarterlyRewards)
          .set({
            totalCartonsPurchased: totalCartons,
            eligibleTierId: eligibleTier?.id || null,
            calculatedReward: calculatedReward.toFixed(2),
            finalReward: (calculatedReward + parseFloat(existingReward.manualAdjustment || '0')).toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(customerQuarterlyRewards.id, existingReward.id))
          .returning();
        
        rewardsData.push({
          ...updated,
          customer,
          eligibleTier,
        });
      } else {
        // Create new record
        const [newReward] = await db
          .insert(customerQuarterlyRewards)
          .values({
            customerId: customer.id,
            quarter: q,
            year: y,
            totalCartonsPurchased: totalCartons,
            eligibleTierId: eligibleTier?.id || null,
            calculatedReward: calculatedReward.toFixed(2),
            manualAdjustment: '0',
            finalReward: calculatedReward.toFixed(2),
            status: 'pending',
          })
          .returning();
        
        rewardsData.push({
          ...newReward,
          customer,
          eligibleTier,
        });
      }
    }
    
    return res.json({ success: true, data: rewardsData });
  } catch (error: any) {
    console.error('Error fetching customer rewards:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch customer rewards',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/customer-rewards/:id
 * Update manual adjustment for a customer reward
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { manualAdjustment, notes } = req.body;
    
    if (manualAdjustment === undefined) {
      return res.status(400).json({ error: 'Manual adjustment is required' });
    }
    
    // Get the current reward
    const [currentReward] = await db
      .select()
      .from(customerQuarterlyRewards)
      .where(eq(customerQuarterlyRewards.id, id));
    
    if (!currentReward) {
      return res.status(404).json({ error: 'Customer reward not found' });
    }
    
    // Check if already processed
    if (currentReward.status === 'processed') {
      return res.status(400).json({ error: 'Cannot modify processed rewards' });
    }
    
    // Calculate final reward
    const calculatedReward = parseFloat(currentReward.calculatedReward);
    const adjustment = parseFloat(manualAdjustment);
    const finalReward = calculatedReward + adjustment;
    
    // Update the reward
    const [updated] = await db
      .update(customerQuarterlyRewards)
      .set({
        manualAdjustment: adjustment.toFixed(2),
        finalReward: finalReward.toFixed(2),
        notes: notes || currentReward.notes,
        updatedAt: new Date(),
      })
      .where(eq(customerQuarterlyRewards.id, id))
      .returning();
    
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating customer reward:', error);
    res.status(500).json({ error: 'Failed to update customer reward' });
  }
});

/**
 * POST /api/customer-rewards/process
 * Process all pending rewards for a quarter
 */
router.post('/process', async (req: AuthenticatedRequest, res) => {
  try {
    const { quarter, year } = req.body;
    const adminUserId = req.user?.id; // From auth middleware
    
    if (!quarter || !year) {
      return res.status(400).json({ error: 'Quarter and year are required' });
    }
    
    if (!adminUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const q = parseInt(quarter as string);
    const y = parseInt(year as string);
    
    // Get all pending rewards for the quarter
    const pendingRewards = await db
      .select()
      .from(customerQuarterlyRewards)
      .where(
        and(
          eq(customerQuarterlyRewards.quarter, q),
          eq(customerQuarterlyRewards.year, y),
          eq(customerQuarterlyRewards.status, 'pending')
        )
      );
    
    if (pendingRewards.length === 0) {
      return res.status(400).json({ error: 'No pending rewards to process' });
    }
    
    const processedRewards = [];
    const errors = [];
    
    // Process each reward in a transaction
    for (const reward of pendingRewards) {
      try {
        const finalReward = parseFloat(reward.finalReward);
        
        // Skip if final reward is 0 or negative
        if (finalReward <= 0) {
          continue;
        }
        
        // Create payment record
        const paymentNumber = `RWD-${Date.now()}-${reward.customerId.slice(0, 8)}`;
        const [payment] = await db
          .insert(payments)
          .values({
            paymentNumber,
            customerId: reward.customerId,
            amount: finalReward.toFixed(2),
            method: 'credit',
            type: 'reward',
            status: 'completed',
            reference: `Q${q} ${y} Reward`,
            notes: `Quarterly reward for ${q}/${y}`,
            processedAt: new Date(),
          })
          .returning();
        
        // Update customer wallet balance
        await db
          .update(customers)
          .set({
            walletBalance: sql`${customers.walletBalance} + ${finalReward}`,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, reward.customerId));
        
        // Mark reward as processed
        const [processed] = await db
          .update(customerQuarterlyRewards)
          .set({
            status: 'processed',
            paymentId: payment.id,
            processedAt: new Date(),
            processedBy: adminUserId,
            updatedAt: new Date(),
          })
          .where(eq(customerQuarterlyRewards.id, reward.id))
          .returning();
        
        processedRewards.push(processed);
      } catch (error: any) {
        console.error(`Error processing reward ${reward.id}:`, error);
        errors.push({
          customerId: reward.customerId,
          error: error.message,
        });
      }
    }
    
    res.json({
      message: 'Rewards processed successfully',
      processedCount: processedRewards.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error processing rewards:', error);
    res.status(500).json({ error: 'Failed to process rewards' });
  }
});

/**
 * GET /api/customer-rewards/customer/:customerId
 * Get all rewards for a specific customer
 */
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const rewards = await db
      .select()
      .from(customerQuarterlyRewards)
      .where(eq(customerQuarterlyRewards.customerId, customerId))
      .orderBy(desc(customerQuarterlyRewards.year), desc(customerQuarterlyRewards.quarter));
    
    res.json(rewards);
  } catch (error: any) {
    console.error('Error fetching customer rewards:', error);
    res.status(500).json({ error: 'Failed to fetch customer rewards' });
  }
});

export default router;
