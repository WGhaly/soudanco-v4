import { Router, Response } from 'express';
import { db, payments, orders, customers } from '../db';
import { eq, desc, sql, gte, lte, and, sum } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireSupervisor } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireSupervisor);

// Generate payment number
function generatePaymentNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAY-${year}${month}-${random}`;
}

// GET /api/payments - List all payments
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, customerId, fromDate, toDate } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(payments.status, status as "pending" | "completed" | "failed" | "refunded"));
    }
    if (customerId) {
      conditions.push(eq(payments.customerId, customerId as string));
    }
    if (fromDate) {
      conditions.push(gte(payments.createdAt, new Date(fromDate as string)));
    }
    if (toDate) {
      // Add one day to include the entire end date
      const endDate = new Date(toDate as string);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(lte(payments.createdAt, endDate));
    }

    let query = db
      .select({
        id: payments.id,
        paymentNumber: payments.paymentNumber,
        amount: payments.amount,
        method: payments.method,
        status: payments.status,
        reference: payments.reference,
        notes: payments.notes,
        createdAt: payments.createdAt,
        customer: {
          id: customers.id,
          businessName: customers.businessName,
          businessNameAr: customers.businessNameAr,
        },
        order: {
          id: orders.id,
          orderNumber: orders.orderNumber,
        },
      })
      .from(payments)
      .leftJoin(customers, eq(payments.customerId, customers.id))
      .leftJoin(orders, eq(payments.orderId, orders.id));

    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(sql`${sql.join(conditions, sql` AND `)}`) as any;
    }

    const result = await query
      .orderBy(desc(payments.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Count with same filters
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(payments);
    if (conditions.length > 0) {
      countQuery = countQuery.where(sql`${sql.join(conditions, sql` AND `)}`) as any;
    }
    const [countResult] = await countQuery;

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
    console.error('List payments error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
});

// GET /api/payments/stats - Get payment statistics (must be before /:id)
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build date conditions
    const conditions = [eq(payments.status, 'completed')];
    if (fromDate) {
      conditions.push(gte(payments.createdAt, new Date(fromDate as string)));
    }
    if (toDate) {
      const endDate = new Date(toDate as string);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(lte(payments.createdAt, endDate));
    }

    // Get total payments within date range
    const [totalPayments] = await db
      .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
      .from(payments)
      .where(and(...conditions));

    // Get daily payments for chart (last 30 days or within date range)
    const startDate = fromDate 
      ? new Date(fromDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDateChart = toDate ? new Date(toDate as string) : new Date();

    const dailyPayments = await db
      .select({
        date: sql<string>`DATE(${payments.createdAt})`,
        total: sql<string>`SUM(${payments.amount})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        gte(payments.createdAt, startDate),
        lte(payments.createdAt, endDateChart)
      ))
      .groupBy(sql`DATE(${payments.createdAt})`)
      .orderBy(sql`DATE(${payments.createdAt})`);

    // Get total uncovered credit (currentBalance across all customers)
    const [uncoveredCredit] = await db
      .select({ total: sql<string>`COALESCE(SUM(${customers.currentBalance}), 0)` })
      .from(customers);

    return res.json({
      success: true,
      data: {
        totalPayments: totalPayments.total,
        uncoveredCredit: uncoveredCredit.total,
        dailyPayments: dailyPayments.map(d => ({
          date: d.date,
          total: parseFloat(d.total || '0'),
          count: d.count,
        })),
      },
    });
  } catch (error) {
    console.error('Payment stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch payment stats' });
  }
});

// GET /api/payments/:id - Get payment details
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentId = req.params.id as string;

    const [payment] = await db
      .select({
        id: payments.id,
        paymentNumber: payments.paymentNumber,
        amount: payments.amount,
        method: payments.method,
        status: payments.status,
        reference: payments.reference,
        notes: payments.notes,
        processedAt: payments.processedAt,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        customer: {
          id: customers.id,
          businessName: customers.businessName,
          businessNameAr: customers.businessNameAr,
          phone: customers.phone,
        },
        order: {
          id: orders.id,
          orderNumber: orders.orderNumber,
          total: orders.total,
        },
      })
      .from(payments)
      .leftJoin(customers, eq(payments.customerId, customers.id))
      .leftJoin(orders, eq(payments.orderId, orders.id))
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    return res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch payment' });
  }
});

// POST /api/payments - Create payment
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, orderId, amount, method, reference, notes } = req.body;

    if (!customerId || !amount || !method) {
      return res.status(400).json({ success: false, error: 'Customer, amount, and method required' });
    }

    const [newPayment] = await db.insert(payments).values({
      paymentNumber: generatePaymentNumber(),
      customerId,
      orderId: orderId || null,
      amount: amount.toString(),
      method,
      status: 'completed',
      reference,
      notes,
      processedAt: new Date(),
    }).returning();

    // Update order paid amount if orderId provided
    if (orderId) {
      await db
        .update(orders)
        .set({
          paidAmount: sql`${orders.paidAmount} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    }

    return res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create payment' });
  }
});

// PUT /api/payments/:id/status - Update payment status
router.put('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentId = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // Get current payment to check old status
    const [currentPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!currentPayment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // Update payment status
    const [updated] = await db
      .update(payments)
      .set({ 
        status, 
        processedAt: status === 'completed' ? new Date() : currentPayment.processedAt,
        updatedAt: new Date() 
      })
      .where(eq(payments.id, paymentId))
      .returning();

    // Handle credit limit updates
    if (currentPayment.status !== status && currentPayment.customerId) {
      const [customer] = await db
        .select({ currentBalance: customers.currentBalance })
        .from(customers)
        .where(eq(customers.id, currentPayment.customerId))
        .limit(1);

      if (customer) {
        const currentBalance = parseFloat(customer.currentBalance || '0');
        const paymentAmount = parseFloat(currentPayment.amount);
        let newBalance = currentBalance;

        // If payment changes from pending to completed, reduce balance (frees up credit)
        if (currentPayment.status === 'pending' && status === 'completed') {
          newBalance = currentBalance - paymentAmount;
        }
        // If payment changes from completed back to pending, increase balance (uses credit again)
        else if (currentPayment.status === 'completed' && status === 'pending') {
          newBalance = currentBalance + paymentAmount;
        }

        // Update customer balance
        if (newBalance !== currentBalance) {
          await db
            .update(customers)
            .set({ 
              currentBalance: newBalance.toFixed(2),
              updatedAt: new Date() 
            })
            .where(eq(customers.id, currentPayment.customerId));
        }
      }
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
});

// DELETE /api/payments/:id - Delete payment (refund)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentId = req.params.id as string;

    const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // If payment was linked to order, reduce paid amount
    if (payment.orderId) {
      await db
        .update(orders)
        .set({
          paidAmount: sql`${orders.paidAmount} - ${payment.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payment.orderId));
    }

    await db.delete(payments).where(eq(payments.id, paymentId));

    return res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    console.error('Delete payment error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete payment' });
  }
});

export default router;
