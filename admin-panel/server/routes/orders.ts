import { Router, Response } from 'express';
import { db, orders, orderItems, customers, products, customerAddresses } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireSupervisor } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireSupervisor);

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
}

// GET /api/orders - List all orders
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        subtotal: orders.subtotal,
        discountAmount: orders.discountAmount,
        taxAmount: orders.taxAmount,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        paidAmount: orders.paidAmount,
        createdAt: orders.createdAt,
        customer: {
          id: customers.id,
          businessName: customers.businessName,
          businessNameAr: customers.businessNameAr,
        },
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(orders);

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
    console.error('List orders error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id as string;

    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerId: orders.customerId,
        addressId: orders.addressId,
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
        customer: {
          id: customers.id,
          businessName: customers.businessName,
          businessNameAr: customers.businessNameAr,
          phone: customers.phone,
        },
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
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
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Get address if exists
    let address = null;
    if (order.addressId) {
      const [addr] = await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.id, order.addressId))
        .limit(1);
      address = addr;
    }

    return res.json({ success: true, data: { ...order, items, address } });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// POST /api/orders - Create order (admin can create for customers)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, addressId, items, notes, paymentMethod } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Customer and items required' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (!product) continue;

      const unitPrice = parseFloat(item.unitPrice || product.basePrice);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
      });
    }

    const total = subtotal;

    const [newOrder] = await db.insert(orders).values({
      orderNumber: generateOrderNumber(),
      customerId,
      addressId: addressId || null,
      status: 'pending',
      subtotal: subtotal.toFixed(2),
      discountAmount: '0',
      taxAmount: '0',
      total: total.toFixed(2),
      notes,
      paymentMethod,
      paidAmount: '0',
    }).returning();

    // Insert order items
    await db.insert(orderItems).values(
      orderItemsData.map(item => ({ ...item, orderId: newOrder.id }))
    );

    // Update customer stats
    await db
      .update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpent: sql`${customers.totalSpent} + ${total}`,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId));

    return res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

export default router;
