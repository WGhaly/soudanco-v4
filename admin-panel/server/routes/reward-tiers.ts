import { Router } from 'express';
import { db } from '../db';
import { rewardTiers } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/reward-tiers
 * List all reward tiers, optionally filter by quarter and year
 */
router.get('/', async (req, res) => {
  try {
    const { quarter, year } = req.query;
    
    let query = db.select().from(rewardTiers);
    
    if (quarter && year) {
      query = query.where(
        and(
          eq(rewardTiers.quarter, parseInt(quarter as string)),
          eq(rewardTiers.year, parseInt(year as string))
        )
      );
    }
    
    const tiers = await query.orderBy(desc(rewardTiers.year), rewardTiers.quarter, rewardTiers.minCartons);
    
    res.json(tiers);
  } catch (error: any) {
    console.error('Error fetching reward tiers:', error);
    res.status(500).json({ error: 'Failed to fetch reward tiers' });
  }
});

/**
 * GET /api/reward-tiers/:id
 * Get a specific reward tier
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tier] = await db
      .select()
      .from(rewardTiers)
      .where(eq(rewardTiers.id, id));
    
    if (!tier) {
      return res.status(404).json({ error: 'Reward tier not found' });
    }
    
    res.json(tier);
  } catch (error: any) {
    console.error('Error fetching reward tier:', error);
    res.status(500).json({ error: 'Failed to fetch reward tier' });
  }
});

/**
 * POST /api/reward-tiers
 * Create a new reward tier
 */
router.post('/', async (req, res) => {
  try {
    const { name, nameAr, quarter, year, minCartons, maxCartons, cashbackPerCarton, isActive } = req.body;
    
    // Validate required fields
    if (!name || !quarter || !year || minCartons === undefined || !cashbackPerCarton) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate quarter
    if (quarter < 1 || quarter > 4) {
      return res.status(400).json({ error: 'Quarter must be between 1 and 4' });
    }
    
    // Validate positive values
    if (minCartons < 0 || parseFloat(cashbackPerCarton) < 0) {
      return res.status(400).json({ error: 'Cartons and cashback must be positive' });
    }
    
    // Validate maxCartons if provided
    if (maxCartons !== undefined && maxCartons !== null && maxCartons < minCartons) {
      return res.status(400).json({ error: 'Max cartons must be greater than min cartons' });
    }
    
    const [newTier] = await db
      .insert(rewardTiers)
      .values({
        name,
        nameAr: nameAr || null,
        quarter,
        year,
        minCartons,
        maxCartons: maxCartons || null,
        cashbackPerCarton,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();
    
    res.status(201).json(newTier);
  } catch (error: any) {
    console.error('Error creating reward tier:', error);
    res.status(500).json({ error: 'Failed to create reward tier' });
  }
});

/**
 * PUT /api/reward-tiers/:id
 * Update a reward tier
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nameAr, quarter, year, minCartons, maxCartons, cashbackPerCarton, isActive } = req.body;
    
    // Validate quarter if provided
    if (quarter !== undefined && (quarter < 1 || quarter > 4)) {
      return res.status(400).json({ error: 'Quarter must be between 1 and 4' });
    }
    
    // Validate positive values
    if (minCartons !== undefined && minCartons < 0) {
      return res.status(400).json({ error: 'Min cartons must be positive' });
    }
    
    if (cashbackPerCarton !== undefined && parseFloat(cashbackPerCarton) < 0) {
      return res.status(400).json({ error: 'Cashback must be positive' });
    }
    
    // Validate maxCartons if provided
    if (maxCartons !== undefined && maxCartons !== null && minCartons !== undefined && maxCartons < minCartons) {
      return res.status(400).json({ error: 'Max cartons must be greater than min cartons' });
    }
    
    const [updatedTier] = await db
      .update(rewardTiers)
      .set({
        ...(name && { name }),
        ...(nameAr !== undefined && { nameAr }),
        ...(quarter && { quarter }),
        ...(year && { year }),
        ...(minCartons !== undefined && { minCartons }),
        ...(maxCartons !== undefined && { maxCartons }),
        ...(cashbackPerCarton && { cashbackPerCarton }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(rewardTiers.id, id))
      .returning();
    
    if (!updatedTier) {
      return res.status(404).json({ error: 'Reward tier not found' });
    }
    
    res.json(updatedTier);
  } catch (error: any) {
    console.error('Error updating reward tier:', error);
    res.status(500).json({ error: 'Failed to update reward tier' });
  }
});

/**
 * DELETE /api/reward-tiers/:id
 * Delete a reward tier
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedTier] = await db
      .delete(rewardTiers)
      .where(eq(rewardTiers.id, id))
      .returning();
    
    if (!deletedTier) {
      return res.status(404).json({ error: 'Reward tier not found' });
    }
    
    res.json({ message: 'Reward tier deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting reward tier:', error);
    res.status(500).json({ error: 'Failed to delete reward tier' });
  }
});

export default router;
