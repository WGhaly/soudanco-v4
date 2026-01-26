import { Router, Response } from 'express';
import { db, customers, users, customerAddresses, priceLists, supervisors } from '../db';
import { eq, desc, ilike, or, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireSupervisor } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireSupervisor);

// ============================================
// GET /api/customers - List all customers
// ============================================
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select({
        id: customers.id,
        businessName: customers.businessName,
        businessNameAr: customers.businessNameAr,
        contactName: customers.contactName,
        phone: customers.phone,
        email: customers.email,
        creditLimit: customers.creditLimit,
        currentBalance: customers.currentBalance,
        walletBalance: customers.walletBalance,
        totalOrders: customers.totalOrders,
        totalSpent: customers.totalSpent,
        isActive: customers.isActive,
        createdAt: customers.createdAt,
        priceList: {
          id: priceLists.id,
          name: priceLists.name,
        },
        supervisor: {
          id: supervisors.id,
          name: supervisors.name,
        },
      })
      .from(customers)
      .leftJoin(priceLists, eq(customers.priceListId, priceLists.id))
      .leftJoin(supervisors, eq(customers.supervisorId, supervisors.id))
      .orderBy(desc(customers.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Apply search filter
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        or(
          ilike(customers.businessName, searchTerm),
          ilike(customers.businessNameAr, searchTerm),
          ilike(customers.contactName, searchTerm),
          ilike(customers.phone, searchTerm),
          ilike(customers.email, searchTerm)
        )
      ) as typeof query;
    }

    // Apply status filter
    if (status === 'active') {
      query = query.where(eq(customers.isActive, true)) as typeof query;
    } else if (status === 'inactive') {
      query = query.where(eq(customers.isActive, false)) as typeof query;
    }

    const result = await query;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers);

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
    console.error('List customers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
    });
  }
});

// ============================================
// GET /api/customers/:id - Get customer by ID
// ============================================
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const [customer] = await db
      .select({
        id: customers.id,
        userId: customers.userId,
        businessName: customers.businessName,
        businessNameAr: customers.businessNameAr,
        contactName: customers.contactName,
        phone: customers.phone,
        email: customers.email,
        creditLimit: customers.creditLimit,
        currentBalance: customers.currentBalance,
        walletBalance: customers.walletBalance,
        totalOrders: customers.totalOrders,
        totalSpent: customers.totalSpent,
        isActive: customers.isActive,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        priceListId: customers.priceListId,
        supervisorId: customers.supervisorId,
        priceList: {
          id: priceLists.id,
          name: priceLists.name,
          nameAr: priceLists.nameAr,
        },
        supervisor: {
          id: supervisors.id,
          name: supervisors.name,
          nameAr: supervisors.nameAr,
        },
      })
      .from(customers)
      .leftJoin(priceLists, eq(customers.priceListId, priceLists.id))
      .leftJoin(supervisors, eq(customers.supervisorId, supervisors.id))
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Get addresses
    const addresses = await db
      .select()
      .from(customerAddresses)
      .where(eq(customerAddresses.customerId, id));

    return res.json({
      success: true,
      data: {
        ...customer,
        addresses,
      },
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
    });
  }
});

// ============================================
// POST /api/customers - Create customer
// ============================================
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      email,
      password,
      businessName,
      businessNameAr,
      contactName,
      phone,
      priceListId,
      supervisorId,
      rewardCategory,
      creditLimit,
      address,
    } = req.body;

    // Validation
    if (!email || !password || !businessName || !contactName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Check if email exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer',
      isActive: true,
    }).returning();

    // Create customer
    const [newCustomer] = await db.insert(customers).values({
      userId: newUser.id,
      businessName,
      businessNameAr,
      contactName,
      phone,
      email: email.toLowerCase(),
      priceListId: priceListId || null,
      supervisorId: supervisorId || null,
      rewardCategory: rewardCategory || null,
      creditLimit: creditLimit || '0',
      currentBalance: '0',
      walletBalance: '0',
      totalOrders: 0,
      totalSpent: '0',
      isActive: true,
    }).returning();

    // Create address if provided
    if (address) {
      await db.insert(customerAddresses).values({
        customerId: newCustomer.id,
        label: address.label || 'Default',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        country: address.country || 'Saudi Arabia',
        isDefault: true,
      });
    }

    return res.status(201).json({
      success: true,
      data: newCustomer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create customer',
    });
  }
});

// ============================================
// PUT /api/customers/:id - Update customer
// ============================================
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      businessName,
      businessNameAr,
      contactName,
      phone,
      email,
      priceListId,
      supervisorId,
      rewardCategory,
      creditLimit,
      isActive,
    } = req.body;

    // Check if customer exists
    const [existing] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Update customer
    const [updated] = await db
      .update(customers)
      .set({
        businessName: businessName ?? existing.businessName,
        businessNameAr: businessNameAr ?? existing.businessNameAr,
        contactName: contactName ?? existing.contactName,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        priceListId: priceListId !== undefined ? priceListId : existing.priceListId,
        supervisorId: supervisorId !== undefined ? supervisorId : existing.supervisorId,
        rewardCategory: rewardCategory !== undefined ? rewardCategory : existing.rewardCategory,
        creditLimit: creditLimit ?? existing.creditLimit,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();

    // Update user active status if changed
    if (isActive !== undefined && isActive !== existing.isActive) {
      await db
        .update(users)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(users.id, existing.userId));
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update customer',
    });
  }
});

// ============================================
// DELETE /api/customers/:id - Delete customer
// ============================================
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const [existing] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    // Delete user (cascades to customer)
    await db.delete(users).where(eq(users.id, existing.userId));

    return res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
    });
  }
});

export default router;
