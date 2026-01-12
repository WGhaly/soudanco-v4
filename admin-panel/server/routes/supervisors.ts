import { Router, Response } from 'express';
import { db, supervisors, users, customers } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/supervisors - List all supervisors
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const result = await db
      .select({
        id: supervisors.id,
        userId: supervisors.userId,
        name: supervisors.name,
        nameAr: supervisors.nameAr,
        phone: supervisors.phone,
        region: supervisors.region,
        isActive: supervisors.isActive,
        createdAt: supervisors.createdAt,
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(supervisors)
      .leftJoin(users, eq(supervisors.userId, users.id))
      .orderBy(desc(supervisors.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get assigned customer count for each supervisor
    const supervisorsWithCounts = await Promise.all(
      result.map(async (supervisor) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(customers)
          .where(eq(customers.supervisorId, supervisor.id));
        return {
          ...supervisor,
          assignedCustomers: Number(countResult.count),
        };
      })
    );

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(supervisors);

    return res.json({
      success: true,
      data: supervisorsWithCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: Number(countResult.count),
        totalPages: Math.ceil(Number(countResult.count) / limitNum),
      },
    });
  } catch (error) {
    console.error('List supervisors error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch supervisors' });
  }
});

// GET /api/supervisors/:id - Get supervisor details
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supervisorId = req.params.id as string;

    const [supervisor] = await db
      .select({
        id: supervisors.id,
        userId: supervisors.userId,
        name: supervisors.name,
        nameAr: supervisors.nameAr,
        phone: supervisors.phone,
        region: supervisors.region,
        isActive: supervisors.isActive,
        createdAt: supervisors.createdAt,
        updatedAt: supervisors.updatedAt,
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(supervisors)
      .leftJoin(users, eq(supervisors.userId, users.id))
      .where(eq(supervisors.id, supervisorId))
      .limit(1);

    if (!supervisor) {
      return res.status(404).json({ success: false, error: 'Supervisor not found' });
    }

    // Get assigned customer count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(eq(customers.supervisorId, supervisorId));

    return res.json({
      success: true,
      data: {
        ...supervisor,
        assignedCustomers: Number(countResult.count),
      },
    });
  } catch (error) {
    console.error('Get supervisor error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch supervisor' });
  }
});

// POST /api/supervisors - Create supervisor with user account
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name, nameAr, phone, region, isActive } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, error: 'Email, password, name, and phone required' });
    }

    // Check if email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      role: 'supervisor',
    }).returning();

    // Create supervisor
    const [newSupervisor] = await db.insert(supervisors).values({
      userId: newUser.id,
      name,
      nameAr,
      phone,
      region,
      isActive: isActive ?? true,
    }).returning();

    return res.status(201).json({
      success: true,
      data: {
        ...newSupervisor,
        user: { id: newUser.id, email: newUser.email },
        assignedCustomers: 0,
      },
    });
  } catch (error) {
    console.error('Create supervisor error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create supervisor' });
  }
});

// PUT /api/supervisors/:id - Update supervisor
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supervisorId = req.params.id as string;
    const { email, password, name, nameAr, phone, region, isActive } = req.body;

    const [existing] = await db.select().from(supervisors).where(eq(supervisors.id, supervisorId)).limit(1);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Supervisor not found' });
    }

    // Update user if email or password provided
    if (existing.userId && (email || password)) {
      const userUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (email) userUpdate.email = email;
      if (password) userUpdate.passwordHash = await bcrypt.hash(password, 10);

      await db.update(users).set(userUpdate).where(eq(users.id, existing.userId));
    }

    const [updated] = await db
      .update(supervisors)
      .set({
        name: name ?? existing.name,
        nameAr: nameAr ?? existing.nameAr,
        phone: phone ?? existing.phone,
        region: region ?? existing.region,
        isActive: isActive ?? existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(supervisors.id, supervisorId))
      .returning();

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update supervisor error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update supervisor' });
  }
});

// DELETE /api/supervisors/:id - Delete supervisor
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supervisorId = req.params.id as string;

    const [supervisor] = await db.select().from(supervisors).where(eq(supervisors.id, supervisorId)).limit(1);
    if (!supervisor) {
      return res.status(404).json({ success: false, error: 'Supervisor not found' });
    }

    // Delete supervisor record
    await db.delete(supervisors).where(eq(supervisors.id, supervisorId));

    // Deactivate associated user
    if (supervisor.userId) {
      await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, supervisor.userId));
    }

    return res.json({ success: true, message: 'Supervisor deleted' });
  } catch (error) {
    console.error('Delete supervisor error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete supervisor' });
  }
});

export default router;
