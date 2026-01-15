import { Router, Response } from 'express';
import { db, products, categories, priceListItems } from '../db';
import { eq, desc, ilike, or, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireSupervisor } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireSupervisor);

// ============================================
// GET /api/products - List all products
// ============================================
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, category, status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        nameAr: products.nameAr,
        description: products.description,
        basePrice: products.basePrice,
        unit: products.unit,
        unitsPerCase: products.unitsPerCase,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        stockStatus: products.stockStatus,
        imageUrl: products.imageUrl,
        isActive: products.isActive,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Apply search filter
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          ilike(products.name, searchTerm),
          ilike(products.nameAr, searchTerm),
          ilike(products.sku, searchTerm)
        )
      ) as typeof query;
    }

    // Apply category filter
    if (category) {
      query = query.where(eq(products.categoryId, category as string)) as typeof query;
    }

    // Apply status filter
    if (status === 'active') {
      query = query.where(eq(products.isActive, true)) as typeof query;
    } else if (status === 'inactive') {
      query = query.where(eq(products.isActive, false)) as typeof query;
    }

    const result = await query;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    return res.json({
      success: true,
      data: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countResult.count),
        totalPages: Math.ceil(Number(countResult.count) / limitNum),
      },
    });
  } catch (error) {
    console.error('List products error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
});

// ============================================
// GET /api/products/:id - Get product by ID
// ============================================
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const [product] = await db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        nameAr: products.nameAr,
        description: products.description,
        descriptionAr: products.descriptionAr,
        categoryId: products.categoryId,
        basePrice: products.basePrice,
        unit: products.unit,
        unitsPerCase: products.unitsPerCase,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        stockStatus: products.stockStatus,
        imageUrl: products.imageUrl,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
});

// ============================================
// POST /api/products - Create product
// ============================================
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      sku,
      name,
      nameAr,
      description,
      descriptionAr,
      categoryId,
      basePrice,
      unit,
      unitsPerCase,
      stockQuantity,
      lowStockThreshold,
      imageUrl,
      isActive,
      priceListItems: priceListItemsData,
    } = req.body;

    // Validation
    if (!name || !basePrice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, basePrice',
      });
    }

    // Auto-generate SKU if not provided
    let productSku = sku;
    if (!productSku) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      productSku = `PRD-${timestamp}-${random}`;
    }

    // Check if SKU exists
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.sku, productSku))
      .limit(1);

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists',
      });
    }

    // Calculate stock status
    const qty = stockQuantity || 0;
    const threshold = lowStockThreshold || 10;
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (qty === 0) {
      stockStatus = 'out_of_stock';
    } else if (qty <= threshold) {
      stockStatus = 'low_stock';
    }

    const [newProduct] = await db.insert(products).values({
      sku: productSku,
      name,
      nameAr,
      description,
      descriptionAr,
      categoryId: categoryId || null,
      basePrice,
      unit: unit || 'case',
      unitsPerCase: unitsPerCase || 1,
      stockQuantity: qty,
      lowStockThreshold: threshold,
      stockStatus,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    // Insert price list items if provided
    if (priceListItemsData && Array.isArray(priceListItemsData) && priceListItemsData.length > 0) {
      const itemsToInsert = priceListItemsData
        .filter((item: any) => item.priceListId && item.price)
        .map((item: any) => ({
          priceListId: item.priceListId,
          productId: newProduct.id,
          price: item.price,
        }));

      if (itemsToInsert.length > 0) {
        await db.insert(priceListItems).values(itemsToInsert);
      }
    }

    return res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    console.error('Error details:', error.message, error.code, error.detail);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create product',
    });
  }
});

// ============================================
// PUT /api/products/:id - Update product
// ============================================
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      sku,
      name,
      nameAr,
      description,
      descriptionAr,
      categoryId,
      basePrice,
      unit,
      unitsPerCase,
      stockQuantity,
      lowStockThreshold,
      imageUrl,
      isActive,
    } = req.body;

    // Check if product exists
    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Calculate stock status if quantity changed
    const qty = stockQuantity !== undefined ? stockQuantity : existing.stockQuantity;
    const threshold = lowStockThreshold !== undefined ? lowStockThreshold : existing.lowStockThreshold;
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (qty === 0) {
      stockStatus = 'out_of_stock';
    } else if (qty <= threshold) {
      stockStatus = 'low_stock';
    }

    const [updated] = await db
      .update(products)
      .set({
        sku: sku ?? existing.sku,
        name: name ?? existing.name,
        nameAr: nameAr ?? existing.nameAr,
        description: description ?? existing.description,
        descriptionAr: descriptionAr ?? existing.descriptionAr,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        basePrice: basePrice ?? existing.basePrice,
        unit: unit ?? existing.unit,
        unitsPerCase: unitsPerCase ?? existing.unitsPerCase,
        stockQuantity: qty,
        lowStockThreshold: threshold,
        stockStatus,
        imageUrl: imageUrl ?? existing.imageUrl,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
});

// ============================================
// DELETE /api/products/:id - Delete product
// ============================================
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const [existing] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    await db.delete(products).where(eq(products.id, id));

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
});

// ============================================
// GET /api/products/categories/all - List categories
// ============================================
router.get('/categories/all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('List categories error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

export default router;
