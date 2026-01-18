import { Router, Response } from 'express';
import { db } from '../db';
import { cartItems, products, categories, priceListItems, customers, discounts, discountProducts } from '../db/schema';
import { eq, and, sql, lte, gte, inArray } from 'drizzle-orm';
import { customerAuthMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(customerAuthMiddleware);

// ============================================
// GET /api/cart - Get customer's cart
// ============================================
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;

    // Get customer's price list
    const [customer] = await db
      .select({ priceListId: customers.priceListId })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    const priceListId = customer?.priceListId;

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        isFreeItem: cartItems.isFreeItem,
        sourceDiscountId: cartItems.sourceDiscountId,
        productName: products.name,
        productNameAr: products.nameAr,
        productSku: products.sku,
        productImage: products.imageUrl,
        basePrice: products.basePrice,
        unit: products.unit,
        unitsPerCase: products.unitsPerCase,
        stockStatus: products.stockStatus,
        categoryName: categories.name,
        categoryNameAr: categories.nameAr,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.customerId, customerId));

    // Get custom prices if customer has a price list
    let customPrices: Record<string, string> = {};
    if (priceListId) {
      const productIds = items.map(i => i.productId);
      if (productIds.length > 0) {
        const prices = await db
          .select({
            productId: priceListItems.productId,
            price: priceListItems.price,
          })
          .from(priceListItems)
          .where(eq(priceListItems.priceListId, priceListId));

        customPrices = prices.reduce((acc, p) => {
          acc[p.productId] = p.price;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // Add prices and calculate totals
    const itemsWithPrices = items.map(item => {
      const price = customPrices[item.productId] || item.basePrice;
      const totalPrice = parseFloat(price) * item.quantity;
      return {
        ...item,
        price,
        totalPrice: totalPrice.toFixed(2),
      };
    });

    // Calculate cart totals (exclude free items from subtotal display but keep for reference)
    const paidItems = itemsWithPrices.filter(item => !item.isFreeItem);
    const freeItems = itemsWithPrices.filter(item => item.isFreeItem);
    const subtotal = paidItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const itemCount = itemsWithPrices.reduce((sum, item) => sum + item.quantity, 0);
    
    // Track which discounts have already been claimed (have free items in cart)
    const claimedDiscountIds = new Set(
      freeItems.filter(item => item.sourceDiscountId).map(item => item.sourceDiscountId)
    );

    // Fetch active discounts
    const now = new Date();
    const activeDiscounts = await db
      .select({
        id: discounts.id,
        name: discounts.name,
        nameAr: discounts.nameAr,
        description: discounts.description,
        type: discounts.type,
        value: discounts.value,
        minOrderAmount: discounts.minOrderAmount,
        minQuantity: discounts.minQuantity,
        bonusQuantity: discounts.bonusQuantity,
        bonusProductId: discounts.bonusProductId,
      })
      .from(discounts)
      .where(
        and(
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now)
        )
      );

    // Get discount-product associations for product-specific discounts
    const discountIds = activeDiscounts.map(d => d.id);
    let discountProductMap: Record<string, string[]> = {};
    if (discountIds.length > 0) {
      const discountProductsData = await db
        .select({
          discountId: discountProducts.discountId,
          productId: discountProducts.productId,
        })
        .from(discountProducts)
        .where(inArray(discountProducts.discountId, discountIds));

      discountProductsData.forEach(dp => {
        if (!discountProductMap[dp.discountId]) {
          discountProductMap[dp.discountId] = [];
        }
        discountProductMap[dp.discountId].push(dp.productId);
      });
    }

    // Calculate applicable discounts
    const appliedDiscounts: Array<{
      id: string;
      name: string;
      nameAr: string | null;
      type: string;
      value: string;
      discountAmount: number;
      description: string | null;
      bonusQuantity?: number;
      bonusProductId?: string | null;
      minQuantity?: number;
      freeItemsCount?: number;
      eligibleProductIds?: string[];
      alreadyClaimed?: boolean;
    }> = [];

    let totalDiscount = 0;

    for (const discount of activeDiscounts) {
      const discountProductIds = discountProductMap[discount.id] || [];
      const isGlobalDiscount = discountProductIds.length === 0;
      
      // Filter cart items that this discount applies to (EXCLUDE free items from eligibility)
      const applicableItems = (isGlobalDiscount 
        ? paidItems 
        : paidItems.filter(item => discountProductIds.includes(item.productId)));

      if (applicableItems.length === 0) continue;

      const applicableSubtotal = applicableItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
      const applicableQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);

      let discountAmount = 0;
      let isApplicable = false;

      switch (discount.type) {
        case 'percentage':
          // Pay X get Y% off - Check minimum order amount
          if (discount.minOrderAmount) {
            if (applicableSubtotal >= parseFloat(discount.minOrderAmount)) {
              discountAmount = applicableSubtotal * (parseFloat(discount.value) / 100);
              isApplicable = true;
            }
          } else {
            // No minimum, apply percentage to all applicable items
            discountAmount = applicableSubtotal * (parseFloat(discount.value) / 100);
            isApplicable = true;
          }
          break;

        case 'fixed':
          // Fixed amount off
          if (discount.minOrderAmount) {
            if (applicableSubtotal >= parseFloat(discount.minOrderAmount)) {
              discountAmount = parseFloat(discount.value);
              isApplicable = true;
            }
          } else {
            discountAmount = parseFloat(discount.value);
            isApplicable = true;
          }
          break;

        case 'buy_get':
          // Buy X get Y free (applied only once - max Y free items)
          if (discount.minQuantity && discount.bonusQuantity) {
            // Check if this discount has already been claimed
            const alreadyClaimed = claimedDiscountIds.has(discount.id);
            
            if (applicableQuantity >= discount.minQuantity) {
              if (alreadyClaimed) {
                // Discount already claimed - still show it but don't allow re-claiming
                const freeItemsInCart = freeItems.filter(item => item.sourceDiscountId === discount.id);
                const claimedCount = freeItemsInCart.reduce((sum, item) => sum + item.quantity, 0);
                const avgPrice = applicableSubtotal / applicableQuantity;
                discountAmount = claimedCount * avgPrice;
                isApplicable = true;
                (discount as any).freeItemsCount = 0; // No more free items available
                (discount as any).alreadyClaimed = true;
                (discount as any).eligibleProductIds = discountProductIds.length > 0 ? discountProductIds : null;
              } else {
                // Promotion not yet claimed - allow selection
                const freeItemsCount = discount.bonusQuantity;
                const avgPrice = applicableSubtotal / applicableQuantity;
                discountAmount = freeItemsCount * avgPrice;
                isApplicable = true;
                (discount as any).freeItemsCount = freeItemsCount;
                (discount as any).alreadyClaimed = false;
                (discount as any).eligibleProductIds = discountProductIds.length > 0 ? discountProductIds : null;
              }
            }
          }
          break;

        case 'spend_bonus':
          // Spend X get bonus percentage off
          if (discount.minOrderAmount) {
            if (applicableSubtotal >= parseFloat(discount.minOrderAmount)) {
              discountAmount = applicableSubtotal * (parseFloat(discount.value) / 100);
              isApplicable = true;
            }
          }
          break;
      }

      if (isApplicable && discountAmount > 0) {
        totalDiscount += discountAmount;
        appliedDiscounts.push({
          id: discount.id,
          name: discount.name,
          nameAr: discount.nameAr,
          type: discount.type,
          value: discount.value,
          discountAmount: parseFloat(discountAmount.toFixed(2)),
          description: discount.description,
          bonusQuantity: discount.bonusQuantity || undefined,
          bonusProductId: discount.bonusProductId,
          minQuantity: discount.minQuantity || undefined,
          freeItemsCount: (discount as any).freeItemsCount || undefined,
          eligibleProductIds: (discount as any).eligibleProductIds || undefined,
          alreadyClaimed: (discount as any).alreadyClaimed || false,
        });
      }
    }

    const finalTotal = Math.max(0, subtotal - totalDiscount);

    return res.json({
      success: true,
      data: {
        items: itemsWithPrices,
        summary: {
          itemCount,
          subtotal: subtotal.toFixed(2),
          discount: totalDiscount.toFixed(2),
          total: finalTotal.toFixed(2),
        },
        appliedDiscounts,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
      details: errorMessage,
    });
  }
});

// ============================================
// POST /api/cart - Add item to cart
// ============================================
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const { productId, quantity = 1, isFreeItem = false, sourceDiscountId = null } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required',
      });
    }

    // Verify product exists and is active
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check if item already in cart (for free items, check by discount source too)
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.customerId, customerId),
          eq(cartItems.productId, productId),
          eq(cartItems.isFreeItem, isFreeItem),
          isFreeItem && sourceDiscountId 
            ? eq(cartItems.sourceDiscountId, sourceDiscountId)
            : sql`${cartItems.sourceDiscountId} IS NULL`
        )
      )
      .limit(1);

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({
          quantity: existing.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing.id))
        .returning();

      return res.json({
        success: true,
        data: updated,
        message: 'Cart updated',
      });
    }

    // Add new item
    const [created] = await db
      .insert(cartItems)
      .values({
        customerId,
        productId,
        quantity,
        isFreeItem,
        sourceDiscountId,
      })
      .returning();

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Item added to cart',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      details: errorMessage,
    });
  }
});

// ============================================
// PUT /api/cart/:id - Update cart item quantity
// ============================================
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    // Verify cart item belongs to customer
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, id),
          eq(cartItems.customerId, customerId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    if (quantity === 0) {
      // Remove item
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return res.json({
        success: true,
        message: 'Item removed from cart',
      });
    }

    // Update quantity
    const [updated] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, id))
      .returning();

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update cart',
    });
  }
});

// ============================================
// DELETE /api/cart/:id - Remove item from cart
// ============================================
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Verify cart item belongs to customer
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, id),
          eq(cartItems.customerId, customerId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    await db.delete(cartItems).where(eq(cartItems.id, id));

    return res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to remove item',
    });
  }
});

// ============================================
// DELETE /api/cart - Clear entire cart
// ============================================
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;

    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));

    return res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
    });
  }
});

export default router;
