import { Router, Response } from 'express';
import { db } from '../db';
import { products, categories, priceListItems, customers } from '../db/schema';
import { eq, ilike, and, or, sql, desc, asc } from 'drizzle-orm';
import { customerAuthMiddleware, optionalCustomerAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ============================================
// GET /api/products - List products (public with optional auth for pricing)
// ============================================
router.get('/', optionalCustomerAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      category,
      status,
      page = '1',
      limit = '20',
      sort = 'name',
      order = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [eq(products.isActive, true)];

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.nameAr, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(products.categoryId, category as string));
    }

    if (status) {
      if (status === 'in_stock') {
        conditions.push(eq(products.stockStatus, 'in_stock'));
      } else if (status === 'out_of_stock') {
        conditions.push(eq(products.stockStatus, 'out_of_stock'));
      }
    }

    // Get customer's price list if authenticated
    let customerPriceListId: string | null = null;
    if (req.user?.customerId) {
      const [customer] = await db
        .select({ priceListId: customers.priceListId })
        .from(customers)
        .where(eq(customers.id, req.user.customerId))
        .limit(1);
      customerPriceListId = customer?.priceListId || null;
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    // Get products with category
    const orderBy = order === 'desc' ? desc : asc;
    const sortColumn = sort === 'price' ? products.basePrice : 
                       sort === 'createdAt' ? products.createdAt : 
                       products.name;

    const productsList = await db
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
        stockStatus: products.stockStatus,
        stockQuantity: products.stockQuantity,
        imageUrl: products.imageUrl,
        categoryName: categories.name,
        categoryNameAr: categories.nameAr,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderBy(sortColumn))
      .limit(limitNum)
      .offset(offset);

    // Get custom prices if customer has a price list
    let customPrices: Record<string, string> = {};
    if (customerPriceListId) {
      const prices = await db
        .select({
          productId: priceListItems.productId,
          price: priceListItems.price,
        })
        .from(priceListItems)
        .where(eq(priceListItems.priceListId, customerPriceListId));

      customPrices = prices.reduce((acc, p) => {
        acc[p.productId] = p.price;
        return acc;
      }, {} as Record<string, string>);
    }

    // Add custom price to products
    const productsWithPrices = productsList.map(p => ({
      ...p,
      price: customPrices[p.id] || p.basePrice,
      hasCustomPrice: !!customPrices[p.id],
    }));

    return res.json({
      success: true,
      data: productsWithPrices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
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
// GET /api/products/categories - List categories
// ============================================
router.get('/categories', async (req, res) => {
  try {
    const categoriesList = await db
      .select({
        id: categories.id,
        name: categories.name,
        nameAr: categories.nameAr,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    return res.json({
      success: true,
      data: categoriesList,
    });
  } catch (error) {
    console.error('List categories error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

// ============================================
// GET /api/products/:id - Get product details
// ============================================
router.get('/:id', optionalCustomerAuth, async (req: AuthenticatedRequest, res: Response) => {
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
        stockStatus: products.stockStatus,
        stockQuantity: products.stockQuantity,
        imageUrl: products.imageUrl,
        categoryName: categories.name,
        categoryNameAr: categories.nameAr,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, id), eq(products.isActive, true)))
      .limit(1);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Get custom price if customer is authenticated
    let price = product.basePrice;
    let hasCustomPrice = false;

    if (req.user?.customerId) {
      const [customer] = await db
        .select({ priceListId: customers.priceListId })
        .from(customers)
        .where(eq(customers.id, req.user.customerId))
        .limit(1);

      if (customer?.priceListId) {
        const [customPrice] = await db
          .select({ price: priceListItems.price })
          .from(priceListItems)
          .where(
            and(
              eq(priceListItems.priceListId, customer.priceListId),
              eq(priceListItems.productId, id)
            )
          )
          .limit(1);

        if (customPrice) {
          price = customPrice.price;
          hasCustomPrice = true;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        ...product,
        price,
        hasCustomPrice,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
});

export default router;
