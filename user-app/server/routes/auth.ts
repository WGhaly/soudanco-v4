import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, customers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { customerAuthMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'user-app-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'user-app-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(userId: string, customerId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, customerId, email, role: 'customer' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, customerId, email, role: 'customer' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

// ============================================
// POST /api/auth/login - Customer login
// ============================================
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if user is a customer
    if (user.role !== 'customer') {
      return res.status(401).json({
        success: false,
        error: 'This login is for customers only',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
      });
    }

    // Get customer record
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .limit(1);

    if (!customer || !customer.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Customer account not found or inactive',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, customer.id, user.email);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        customer: {
          id: customer.id,
          businessName: customer.businessName,
          businessNameAr: customer.businessNameAr,
          contactName: customer.contactName,
          phone: customer.phone,
          creditLimit: customer.creditLimit,
          currentBalance: customer.currentBalance,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

// ============================================
// POST /api/auth/logout - Customer logout
// ============================================
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ============================================
// POST /api/auth/refresh - Refresh access token
// ============================================
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: string;
        customerId: string;
        email: string;
        role: string;
      };

      // Verify user still exists and is active
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user || !user.isActive || user.role !== 'customer') {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive account',
        });
      }

      // Generate new tokens
      const tokens = generateTokens(decoded.userId, decoded.customerId, decoded.email);

      // Set new refresh token
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

// ============================================
// GET /api/auth/me - Get current user profile
// ============================================
router.get('/me', customerAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;

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
      data: customer,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

// ============================================
// PUT /api/auth/profile - Update profile
// ============================================
router.put('/profile', customerAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user!;
    const { contactName, phone, email } = req.body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (contactName) updateData.contactName = contactName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const [updated] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId))
      .returning();

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// ============================================
// PUT /api/auth/password - Change password
// ============================================
router.put('/password', customerAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password are required',
      });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
});

export default router;
