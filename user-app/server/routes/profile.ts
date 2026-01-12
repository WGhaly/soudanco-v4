import { Router, Response } from 'express';
import { db } from '../db';
import { 
  customerAddresses, 
  customerPaymentMethods, 
  notifications,
  customers,
  discounts,
  discountProducts,
  products
} from '../db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
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

    return res.json({
      success: true,
      data: methods,
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

    return res.json({
      success: true,
      data: activeDiscounts,
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

    return res.json({
      success: true,
      data: {
        customer,
        stats: {
          creditLimit: customer.creditLimit,
          currentBalance: customer.currentBalance,
          availableCredit: (parseFloat(customer.creditLimit || '0') - parseFloat(customer.currentBalance || '0')).toFixed(2),
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
        },
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

export default router;
