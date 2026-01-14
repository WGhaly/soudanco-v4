import { Router, Response } from 'express';
import { db, discounts, discountProducts, products } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireAdmin, requireSupervisor } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// GET /api/discounts - List all discounts
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const now = new Date();
    const result = await db
      .select()
      .from(discounts)
      .orderBy(desc(discounts.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Add computed status
    const discountsWithStatus = result.map(discount => {
      let computedStatus = 'inactive';
      if (discount.isActive) {
        const start = discount.startDate ? new Date(discount.startDate) : null;
        const end = discount.endDate ? new Date(discount.endDate) : null;
        
        if (start && start > now) {
          computedStatus = 'scheduled';
        } else if (end && end < now) {
          computedStatus = 'expired';
        } else {
          computedStatus = 'active';
        }
      }
      return { ...discount, computedStatus };
    });

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(discounts);

    return res.json({
      success: true,
      data: discountsWithStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countResult.count),
        totalPages: Math.ceil(Number(countResult.count) / limitNum),
      },
    });
  } catch (error) {
    console.error('List discounts error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch discounts' });
  }
});

// GET /api/discounts/:id - Get discount details
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const discountId = req.params.id as string;

    const [discount] = await db
      .select()
      .from(discounts)
      .where(eq(discounts.id, discountId))
      .limit(1);

    if (!discount) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    // Get associated products
    const linkedProducts = await db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        nameAr: products.nameAr,
        basePrice: products.basePrice,
      })
      .from(discountProducts)
      .innerJoin(products, eq(discountProducts.productId, products.id))
      .where(eq(discountProducts.discountId, discountId));

    return res.json({
      success: true,
      data: { ...discount, products: linkedProducts },
    });
  } catch (error) {
    console.error('Get discount error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch discount' });
  }
});

// POST /api/discounts - Create discount (admin/supervisor only)
router.post('/', requireSupervisor, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, nameAr, description, type, value, minOrderAmount, minQuantity, bonusQuantity, bonusProductId, startDate, endDate, isActive, productIds } = req.body;

    if (!name || !type || value === undefined || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Name, type, value, start date, and end date required' });
    }

    const validTypes = ['percentage', 'fixed', 'buy_get', 'spend_bonus'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid discount type' });
    }

    const [newDiscount] = await db.insert(discounts).values({
      name,
      nameAr,
      description,
      type,
      value: value.toString(),
      minOrderAmount: minOrderAmount?.toString(),
      minQuantity,
      bonusQuantity,
      bonusProductId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive ?? true,
    }).returning();

    // Link products if provided
    if (productIds && productIds.length > 0) {
      await db.insert(discountProducts).values(
        productIds.map((productId: string) => ({
          discountId: newDiscount.id,
          productId,
        }))
      );
    }

    return res.status(201).json({ success: true, data: newDiscount });
  } catch (error) {
    console.error('Create discount error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create discount' });
  }
});

// PUT /api/discounts/:id - Update discount (admin only)
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const discountId = req.params.id as string;
    const { name, nameAr, description, type, value, minOrderAmount, minQuantity, bonusQuantity, bonusProductId, startDate, endDate, isActive, productIds } = req.body;

    const [existing] = await db.select().from(discounts).where(eq(discounts.id, discountId)).limit(1);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    const [updated] = await db
      .update(discounts)
      .set({
        name: name ?? existing.name,
        nameAr: nameAr ?? existing.nameAr,
        description: description ?? existing.description,
        type: type ?? existing.type,
        value: value !== undefined ? value.toString() : existing.value,
        minOrderAmount: minOrderAmount !== undefined ? minOrderAmount.toString() : existing.minOrderAmount,
        minQuantity: minQuantity ?? existing.minQuantity,
        bonusQuantity: bonusQuantity ?? existing.bonusQuantity,
        bonusProductId: bonusProductId ?? existing.bonusProductId,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        isActive: isActive ?? existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(discounts.id, discountId))
      .returning();

    // Update product links if provided
    if (productIds !== undefined) {
      await db.delete(discountProducts).where(eq(discountProducts.discountId, discountId));
      
      if (productIds.length > 0) {
        await db.insert(discountProducts).values(
          productIds.map((productId: string) => ({
            discountId,
            productId,
          }))
        );
      }
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update discount error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update discount' });
  }
});

// DELETE /api/discounts/:id - Delete discount (admin only)
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const discountId = req.params.id as string;

    // Delete linked products first
    await db.delete(discountProducts).where(eq(discountProducts.discountId, discountId));

    const [deleted] = await db.delete(discounts).where(eq(discounts.id, discountId)).returning();

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Discount not found' });
    }

    return res.json({ success: true, message: 'Discount deleted' });
  } catch (error) {
    console.error('Delete discount error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete discount' });
  }
});

export default router;
