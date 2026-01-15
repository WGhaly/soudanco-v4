import { Router, Response } from 'express';
import { db } from '../db';
import { 
  orders, 
  orderItems, 
  customers, 
  products, 
  customerAddresses,
  cartItems,
  priceListItems,
  notifications
} from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { customerAuthMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All orders routes require authentication
router.use(customerAuthMiddleware);

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// ============================================
// GET /api/orders - List customer's orders
// ============================================
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [eq(orders.customerId, customerId)];
    if (status) {
      conditions.push(eq(orders.status, status as any));
    }

    // Get count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(...conditions));

    // Get orders with address
    const ordersList = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        subtotal: orders.subtotal,
        discountAmount: orders.discountAmount,
        taxAmount: orders.taxAmount,
        total: orders.total,
        notes: orders.notes,
        paymentMethod: orders.paymentMethod,
        paidAmount: orders.paidAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        addressLabel: customerAddresses.label,
        addressLine1: customerAddresses.addressLine1,
        city: customerAddresses.city,
      })
      .from(orders)
      .leftJoin(customerAddresses, eq(orders.addressId, customerAddresses.id))
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get item count for each order
    const ordersWithItemCount = await Promise.all(
      ordersList.map(async (order) => {
        const [{ count: itemCount }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          itemCount: Number(itemCount),
        };
      })
    );

    return res.json({
      success: true,
      data: ordersWithItemCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

// ============================================
// GET /api/orders/:id - Get order details
// ============================================
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Get order
    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        subtotal: orders.subtotal,
        discountAmount: orders.discountAmount,
        taxAmount: orders.taxAmount,
        total: orders.total,
        notes: orders.notes,
        paymentMethod: orders.paymentMethod,
        paidAmount: orders.paidAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        addressId: orders.addressId,
      })
      .from(orders)
      .where(
        and(
          eq(orders.id, id),
          eq(orders.customerId, customerId)
        )
      )
      .limit(1);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Get address
    let address = null;
    if (order.addressId) {
      const [addr] = await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.id, order.addressId))
        .limit(1);
      address = addr;
    }

    // Get order items
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        productImage: products.imageUrl,
        productNameAr: products.nameAr,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return res.json({
      success: true,
      data: {
        ...order,
        address,
        items,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
});

// ============================================
// POST /api/orders - Create order from cart
// ============================================
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, userId } = req.user!;
    const { addressId, paymentMethodId, paymentType, notes } = req.body;

    // Get customer with price list
    const [customer] = await db
      .select({
        id: customers.id,
        priceListId: customers.priceListId,
        creditLimit: customers.creditLimit,
        currentBalance: customers.currentBalance,
        walletBalance: customers.walletBalance,
        totalOrders: customers.totalOrders,
        totalSpent: customers.totalSpent,
      })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Get cart items
    const cartItemsList = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.name,
        basePrice: products.basePrice,
        stockQuantity: products.stockQuantity,
        isActive: products.isActive,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.customerId, customerId));

    if (cartItemsList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Get custom prices if customer has a price list
    let customPrices: Record<string, string> = {};
    if (customer.priceListId) {
      const prices = await db
        .select({
          productId: priceListItems.productId,
          price: priceListItems.price,
        })
        .from(priceListItems)
        .where(eq(priceListItems.priceListId, customer.priceListId));

      customPrices = prices.reduce((acc, p) => {
        acc[p.productId] = p.price;
        return acc;
      }, {} as Record<string, string>);
    }

    // Validate address if provided
    if (addressId) {
      const [address] = await db
        .select()
        .from(customerAddresses)
        .where(
          and(
            eq(customerAddresses.id, addressId),
            eq(customerAddresses.customerId, customerId)
          )
        )
        .limit(1);

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Invalid address',
        });
      }
    }

    // Calculate order items and total
    let subtotal = 0;
    const orderItemsData = cartItemsList.map(item => {
      const price = parseFloat(customPrices[item.productId] || item.basePrice);
      const totalPrice = price * item.quantity;
      subtotal += totalPrice;

      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: price.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      };
    });

    const total = subtotal; // No discounts or taxes for now

    // ============================================
    // NEW WALLET-BASED PAYMENT LOGIC
    // ============================================
    const walletBalance = parseFloat(customer.walletBalance || '0');
    const creditLimit = parseFloat(customer.creditLimit || '0');
    const creditUsed = parseFloat(customer.currentBalance || '0');
    const availableCredit = creditLimit - creditUsed;
    const totalAvailable = walletBalance + availableCredit;

    // Check if customer can afford the order
    if (total > totalAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds. Please top up your wallet.',
        errorAr: 'رصيد غير كافٍ. الرجاء شحن المحفظة.',
        requiredAmount: total,
        availableAmount: totalAvailable,
      });
    }

    // Calculate how to split payment between wallet and credit
    let walletDeduction = 0;
    let creditDeduction = 0;
    let newWalletBalance = walletBalance;
    let newCreditUsed = creditUsed;

    if (walletBalance >= total) {
      // Wallet covers everything
      walletDeduction = total;
      newWalletBalance = walletBalance - total;
    } else {
      // Use all wallet balance, rest from credit
      walletDeduction = walletBalance;
      creditDeduction = total - walletBalance;
      newWalletBalance = 0;
      newCreditUsed = creditUsed + creditDeduction;
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId,
        addressId: addressId || null,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        discountAmount: '0',
        taxAmount: '0',
        total: total.toFixed(2),
        notes: notes || null,
        paymentMethod: null,
        paidAmount: walletDeduction.toFixed(2), // Track how much was paid from wallet
      })
      .returning();

    // Create order items
    await db.insert(orderItems).values(
      orderItemsData.map(item => ({
        orderId: order.id,
        ...item,
      }))
    );

    // Update customer balances (wallet and credit) and stats
    await db
      .update(customers)
      .set({
        walletBalance: newWalletBalance.toFixed(2),
        currentBalance: newCreditUsed.toFixed(2),
        totalOrders: customer.totalOrders + 1,
        totalSpent: (parseFloat(customer.totalSpent || '0') + total).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId));

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));

    // Create notification
    await db.insert(notifications).values({
      userId,
      type: 'order',
      title: 'Order Placed',
      titleAr: 'تم تقديم الطلب',
      message: `Your order ${orderNumber} has been placed successfully.`,
      messageAr: `تم تقديم طلبك ${orderNumber} بنجاح.`,
      referenceId: order.id,
    });

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

// ============================================
// POST /api/orders/:id/cancel - Cancel order
// ============================================
router.post('/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, id),
          eq(orders.customerId, customerId)
        )
      )
      .limit(1);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending orders can be cancelled',
      });
    }

    // Update order status
    const [updated] = await db
      .update(orders)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return res.json({
      success: true,
      data: updated,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel order',
    });
  }
});

// ============================================
// POST /api/orders/:id/reorder - Reorder (add items to cart)
// ============================================
router.post('/:id/reorder', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, id),
          eq(orders.customerId, customerId)
        )
      )
      .limit(1);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Get order items
    const items = await db
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(orderItems.orderId, id),
          eq(products.isActive, true)
        )
      );

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active products found in this order',
      });
    }

    // Add items to cart (or update quantity if already exists)
    for (const item of items) {
      const [existing] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.customerId, customerId),
            eq(cartItems.productId, item.productId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(cartItems)
          .set({
            quantity: existing.quantity + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({
          customerId,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }

    return res.json({
      success: true,
      message: `${items.length} items added to cart`,
    });
  } catch (error) {
    console.error('Reorder error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reorder',
    });
  }
});

export default router;
