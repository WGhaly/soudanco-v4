import { Router, Response } from 'express';
import { db, orders, payments, customers } from '../db';
import { eq, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireSupervisor } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireSupervisor);

// GET /api/stats/dashboard - Get dashboard statistics
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get total customer count
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers);

    // Get pending orders count
    const [pendingOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'pending'));

    // Get total outstanding balance (sum of customer current balances)
    const [outstandingBalance] = await db
      .select({ total: sql<string>`COALESCE(SUM(current_balance), 0)` })
      .from(customers);

    // Get recent orders for the dashboard table
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        customer: {
          id: customers.id,
          businessName: customers.businessName,
          businessNameAr: customers.businessNameAr,
        },
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(10);

    return res.json({
      success: true,
      data: {
        stats: {
          customerCount: Number(customerCount.count),
          pendingOrders: Number(pendingOrders.count),
          outstandingBalance: outstandingBalance.total || '0',
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
