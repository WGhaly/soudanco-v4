import { Router, Response } from 'express';
import { db, priceLists, priceListItems, products } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireSupervisor } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireSupervisor);

// GET /api/price-lists - List all price lists
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db
      .select({
        id: priceLists.id,
        name: priceLists.name,
        nameAr: priceLists.nameAr,
        description: priceLists.description,
        isDefault: priceLists.isDefault,
        isActive: priceLists.isActive,
        createdAt: priceLists.createdAt,
        itemCount: sql<number>`(SELECT COUNT(*) FROM price_list_items WHERE price_list_id = ${priceLists.id})`,
      })
      .from(priceLists)
      .orderBy(desc(priceLists.createdAt));

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('List price lists error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch price lists' });
  }
});

// GET /api/price-lists/:id - Get price list with items
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const [priceList] = await db
      .select()
      .from(priceLists)
      .where(eq(priceLists.id, id))
      .limit(1);

    if (!priceList) {
      return res.status(404).json({ success: false, error: 'Price list not found' });
    }

    const items = await db
      .select({
        id: priceListItems.id,
        productId: priceListItems.productId,
        price: priceListItems.price,
        product: {
          id: products.id,
          sku: products.sku,
          name: products.name,
          nameAr: products.nameAr,
          basePrice: products.basePrice,
        },
      })
      .from(priceListItems)
      .leftJoin(products, eq(priceListItems.productId, products.id))
      .where(eq(priceListItems.priceListId, id));

    return res.json({ success: true, data: { ...priceList, items } });
  } catch (error) {
    console.error('Get price list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch price list' });
  }
});

// POST /api/price-lists - Create price list
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, nameAr, description, isDefault, items } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.update(priceLists).set({ isDefault: false });
    }

    const [newPriceList] = await db.insert(priceLists).values({
      name,
      nameAr,
      description,
      isDefault: isDefault || false,
      isActive: true,
    }).returning();

    // Add items if provided
    if (items && items.length > 0) {
      await db.insert(priceListItems).values(
        items.map((item: { productId: string; price: string }) => ({
          priceListId: newPriceList.id,
          productId: item.productId,
          price: item.price,
        }))
      );
    }

    return res.status(201).json({ success: true, data: newPriceList });
  } catch (error) {
    console.error('Create price list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create price list' });
  }
});

// PUT /api/price-lists/:id - Update price list
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, nameAr, description, isDefault, isActive, items } = req.body;

    const [existing] = await db.select().from(priceLists).where(eq(priceLists.id, id)).limit(1);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Price list not found' });
    }

    if (isDefault) {
      await db.update(priceLists).set({ isDefault: false });
    }

    const [updated] = await db
      .update(priceLists)
      .set({
        name: name ?? existing.name,
        nameAr: nameAr ?? existing.nameAr,
        description: description ?? existing.description,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(priceLists.id, id))
      .returning();

    // Update items if provided
    if (items) {
      await db.delete(priceListItems).where(eq(priceListItems.priceListId, id));
      if (items.length > 0) {
        await db.insert(priceListItems).values(
          items.map((item: { productId: string; price: string }) => ({
            priceListId: id,
            productId: item.productId,
            price: item.price,
          }))
        );
      }
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update price list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update price list' });
  }
});

// DELETE /api/price-lists/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await db.delete(priceLists).where(eq(priceLists.id, id));
    return res.json({ success: true, message: 'Price list deleted' });
  } catch (error) {
    console.error('Delete price list error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete price list' });
  }
});

export default router;
