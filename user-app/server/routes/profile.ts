import { Router, Response } from 'express';
import { db } from '../db';
import { 
  customerAddresses, 
  customerPaymentMethods, 
  notifications,
  customers,
  discounts,
  discountProducts,
  products,
  orders,
  payments
} from '../db/schema';
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm';
import { customerAuthMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(customerAuthMiddleware);

// ============================================
// ADDRESSES
// ============================================

// GET /api/profile/addresses - List addresses
router.get('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;

    const addresses = await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, customerId))
      .orderBy(desc(customerAddresses.isDefault));

    return res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('List addresses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
    });
  }
});

// POST /api/profile/addresses - Add address
router.post('/addresses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const { label, addressLine1, addressLine2, city, region, postalCode, country, isDefault } = req.body;

    if (!label || !addressLine1 || !city) {
      return res.status(400).json({
        success: false,
        error: 'Label, address line 1, and city are required',
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    const [created] = await db
      .insert(customerAddresses)
      .values({
        customerId,
        label,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        region: region || null,
        postalCode: postalCode || null,
        country: country || 'Saudi Arabia',
        isDefault: isDefault || false,
      })
      .returning();

    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error('Add address error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add address',
    });
  }
});

// PUT /api/profile/addresses/:id - Update address
router.put('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;
    const { label, addressLine1, addressLine2, city, region, postalCode, country, isDefault } = req.body;

    // Verify address belongs to customer
    const [existing] = await db
      .select()
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, id),
          eq(customerAddresses.customerId, customerId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db
        .update(customerAddresses)
        .set({ isDefault: false })
        .where(eq(customerAddresses.customerId, customerId));
    }

    const updateData: Record<string, any> = {};
    if (label !== undefined) updateData.label = label;
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (city !== undefined) updateData.city = city;
    if (region !== undefined) updateData.region = region;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const [updated] = await db
      .update(customerAddresses)
      .set(updateData)
      .where(eq(customerAddresses.id, id))
      .returning();

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update address',
    });
  }
});

// DELETE /api/profile/addresses/:id - Delete address
router.delete('/addresses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Verify address belongs to customer
    const [existing] = await db
      .select()
      .from(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, id),
          eq(customerAddresses.customerId, customerId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    await db.delete(customerAddresses).where(eq(customerAddresses.id, id));

    return res.json({
      success: true,
      message: 'Address deleted',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete address',
    });
  }
});

// ============================================
// PAYMENT METHODS
// ============================================

// GET /api/profile/payment-methods - List payment methods
router.get('/payment-methods', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;

    const methods = await db
      .select()
      .from(customerPaymentMethods)
      .where(eq(customerPaymentMethods.customerId, customerId))
      .orderBy(desc(customerPaymentMethods.isDefault));

    // Transform data to include lastFour and expiryDate from details JSON
    const transformedMethods = methods.map(method => {
      let details: { lastFour?: string; expiryDate?: string; bankName?: string } = {};
      if (method.details) {
        try {
          details = JSON.parse(method.details);
        } catch {
          details = {};
        }
      }
      return {
        id: method.id,
        type: method.type,
        label: method.label,
        lastFour: details.lastFour,
        expiryDate: details.expiryDate,
        isDefault: method.isDefault,
      };
    });

    return res.json({
      success: true,
      data: transformedMethods,
    });
  } catch (error) {
    console.error('List payment methods error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods',
    });
  }
});

// POST /api/profile/payment-methods - Add payment method
router.post('/payment-methods', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const { type, label, details, isDefault } = req.body;

    if (!type || !label) {
      return res.status(400).json({
        success: false,
        error: 'Type and label are required',
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db
        .update(customerPaymentMethods)
        .set({ isDefault: false })
        .where(eq(customerPaymentMethods.customerId, customerId));
    }

    const [created] = await db
      .insert(customerPaymentMethods)
      .values({
        customerId,
        type,
        label,
        details: details ? JSON.stringify(details) : null,
        isDefault: isDefault || false,
      })
      .returning();

    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add payment method',
    });
  }
});

// DELETE /api/profile/payment-methods/:id - Delete payment method
router.delete('/payment-methods/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Verify payment method belongs to customer
    const [existing] = await db
      .select()
      .from(customerPaymentMethods)
      .where(
        and(
          eq(customerPaymentMethods.id, id),
          eq(customerPaymentMethods.customerId, customerId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
      });
    }

    await db.delete(customerPaymentMethods).where(eq(customerPaymentMethods.id, id));

    return res.json({
      success: true,
      message: 'Payment method deleted',
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete payment method',
    });
  }
});

// PUT /api/profile/payment-methods/:id/set-default - Set payment method as default
router.put('/payment-methods/:id/set-default', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const id = req.params.id as string;

    // Verify payment method belongs to customer
    const [existing] = await db
      .select()
      .from(customerPaymentMethods)
      .where(
        and(
          eq(customerPaymentMethods.id, id),
          eq(customerPaymentMethods.customerId, customerId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found',
      });
    }

    // Set all customer's payment methods to not default
    await db
      .update(customerPaymentMethods)
      .set({ isDefault: false })
      .where(eq(customerPaymentMethods.customerId, customerId));

    // Set the specified payment method as default
    await db
      .update(customerPaymentMethods)
      .set({ isDefault: true })
      .where(eq(customerPaymentMethods.id, id));

    return res.json({
      success: true,
      message: 'Default payment method updated',
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to set default payment method',
    });
  }
});

// ============================================
// NOTIFICATIONS
// ============================================

// GET /api/profile/notifications - List notifications
router.get('/notifications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { unread, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(notifications.userId, userId)];
    if (unread === 'true') {
      conditions.push(eq(notifications.isRead, false));
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(...conditions));

    const notificationsList = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get unread count
    const [{ unreadCount }] = await db
      .select({ unreadCount: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return res.json({
      success: true,
      data: notificationsList,
      unreadCount: Number(unreadCount),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
      },
    });
  } catch (error) {
    console.error('List notifications error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

// PUT /api/profile/notifications/:id/read - Mark as read
router.put('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const id = req.params.id as string;

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update notification',
    });
  }
});

// PUT /api/profile/notifications/read-all - Mark all as read
router.put('/notifications/read-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    return res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update notifications',
    });
  }
});

// ============================================
// DISCOUNTS/PROMOTIONS
// ============================================

// GET /api/profile/discounts - Get active discounts for customer
router.get('/discounts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();

    // Get active discounts
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
        startDate: discounts.startDate,
        endDate: discounts.endDate,
      })
      .from(discounts)
      .where(
        and(
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now)
        )
      );

    // Transform to match frontend interface
    const transformedDiscounts = activeDiscounts.map(d => ({
      id: d.id,
      discountId: d.id,
      discountName: d.nameAr || d.name,
      discountType: d.type,
      discountValue: d.value,
      appliesTo: d.description,
      validFrom: d.startDate ? d.startDate.toISOString() : null,
      validUntil: d.endDate ? d.endDate.toISOString() : null,
      isActive: true, // All returned discounts are active
      minOrderAmount: d.minOrderAmount,
      minQuantity: d.minQuantity,
      bonusQuantity: d.bonusQuantity,
    }));

    return res.json({
      success: true,
      data: transformedDiscounts,
    });
  } catch (error) {
    console.error('List discounts error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch discounts',
    });
  }
});

// ============================================
// DASHBOARD/HOME DATA
// ============================================

// GET /api/profile/dashboard - Get customer dashboard data
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;

    // Get customer data
    const [customer] = await db
      .select({
        id: customers.id,
        businessName: customers.businessName,
        businessNameAr: customers.businessNameAr,
        contactName: customers.contactName,
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

    // Get pending orders count
    const pendingOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.customerId, customerId),
          inArray(orders.status, ['pending', 'confirmed', 'processing', 'shipped'])
        )
      );
    const pendingOrders = Number(pendingOrdersResult[0]?.count || 0);

    // Get recent orders
    const recentOrdersList = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    // Get active discounts count
    const now = new Date();
    const activeDiscountsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(discounts)
      .where(
        and(
          eq(discounts.isActive, true),
          lte(discounts.startDate, now),
          gte(discounts.endDate, now)
        )
      );
    const activeDiscounts = Number(activeDiscountsResult[0]?.count || 0);

    return res.json({
      success: true,
      data: {
        // Credit info
        creditLimit: customer.creditLimit,
        currentBalance: customer.currentBalance,
        walletBalance: customer.walletBalance,
        availableCredit: (parseFloat(customer.creditLimit || '0') - parseFloat(customer.currentBalance || '0')).toFixed(2),
        // Order info
        totalOrders: customer.totalOrders,
        pendingOrders,
        totalSpent: customer.totalSpent,
        // Discounts
        activeDiscounts,
        // Recent orders
        recentOrders: recentOrdersList.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt?.toISOString() || '',
        })),
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

// ============================================
// WALLET
// ============================================

// Helper function to generate payment number
function generatePaymentNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

// POST /api/profile/wallet/topup - Top up wallet
router.post('/wallet/topup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const { amount, paymentMethod = 'credit' } = req.body;

    // Validate payment method - must be one of: cash, bank_transfer, credit
    const validMethods = ['cash', 'bank_transfer', 'credit'];
    const method = validMethods.includes(paymentMethod) ? paymentMethod : 'credit';

    // Validate amount
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be a positive number.',
      });
    }

    // Get current customer data
    const [customer] = await db
      .select({
        id: customers.id,
        currentBalance: customers.currentBalance,
        walletBalance: customers.walletBalance,
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

    const currentCreditUsed = parseFloat(customer.currentBalance || '0');
    const currentWalletBalance = parseFloat(customer.walletBalance || '0');

    // Calculate how much goes to credit payment vs wallet
    let creditPaid = 0;
    let walletAdded = 0;

    if (currentCreditUsed > 0) {
      // First, pay off debt
      creditPaid = Math.min(topUpAmount, currentCreditUsed);
      walletAdded = topUpAmount - creditPaid;
    } else {
      // No debt, all goes to wallet
      walletAdded = topUpAmount;
    }

    const newCreditUsed = currentCreditUsed - creditPaid;
    const newWalletBalance = currentWalletBalance + walletAdded;

    // Generate payment number
    const paymentNumber = generatePaymentNumber();

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        paymentNumber,
        customerId,
        orderId: null, // Wallet top-up is not tied to an order
        amount: topUpAmount.toFixed(2),
        method: method as 'cash' | 'bank_transfer' | 'credit',
        status: 'completed',
        notes: creditPaid > 0 
          ? `Wallet top-up: ${creditPaid.toFixed(2)} paid to credit, ${walletAdded.toFixed(2)} added to wallet`
          : `Wallet top-up: ${walletAdded.toFixed(2)} added to wallet`,
        processedAt: new Date(),
      })
      .returning();

    // Update customer balances
    await db
      .update(customers)
      .set({
        currentBalance: newCreditUsed.toFixed(2),
        walletBalance: newWalletBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId));

    return res.json({
      success: true,
      data: {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        amount: topUpAmount,
        creditPaid,
        walletAdded,
        newCreditUsed,
        newWalletBalance,
      },
    });
  } catch (error) {
    console.error('Wallet top-up error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process wallet top-up',
    });
  }
});

export default router;
