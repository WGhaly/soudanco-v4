import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db, users, customers, supervisors } from '../db';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthenticatedRequest, JwtPayload } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

// ============================================
// POST /api/auth/login
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

    // Find user by email
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

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated',
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

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    // Get additional user data based on role
    let userData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'customer') {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id))
        .limit(1);
      
      if (customer) {
        userData = {
          ...userData,
          customerId: customer.id,
          businessName: customer.businessName,
          businessNameAr: customer.businessNameAr,
          contactName: customer.contactName,
          phone: customer.phone,
        };
      }
    } else if (user.role === 'supervisor') {
      const [supervisor] = await db
        .select()
        .from(supervisors)
        .where(eq(supervisors.userId, user.id))
        .limit(1);
      
      if (supervisor) {
        userData = {
          ...userData,
          supervisorId: supervisor.id,
          name: supervisor.name,
          nameAr: supervisor.nameAr,
          phone: supervisor.phone,
          region: supervisor.region,
        };
      }
    }

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
        user: userData,
        accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ============================================
// POST /api/auth/refresh
// ============================================
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    // Verify refresh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    // Verify user still exists and is active
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or deactivated',
      });
    }

    // Generate new tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(payload);

    // Set new refresh token cookie
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
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ============================================
// POST /api/auth/logout
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
// GET /api/auth/me
// ============================================
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    let userData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'customer') {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, user.id))
        .limit(1);
      
      if (customer) {
        userData = {
          ...userData,
          customerId: customer.id,
          businessName: customer.businessName,
          businessNameAr: customer.businessNameAr,
          contactName: customer.contactName,
          phone: customer.phone,
        };
      }
    } else if (user.role === 'supervisor') {
      const [supervisor] = await db
        .select()
        .from(supervisors)
        .where(eq(supervisors.userId, user.id))
        .limit(1);
      
      if (supervisor) {
        userData = {
          ...userData,
          supervisorId: supervisor.id,
          name: supervisor.name,
          nameAr: supervisor.nameAr,
          phone: supervisor.phone,
          region: supervisor.region,
        };
      }
    }

    return res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
