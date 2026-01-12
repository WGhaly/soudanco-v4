import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, customers } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'user-app-jwt-secret-change-in-production';

export interface CustomerPayload {
  userId: string;
  customerId: string;
  email: string;
  role: 'customer';
}

export interface AuthenticatedRequest extends Request {
  user?: CustomerPayload;
}

export async function customerAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as CustomerPayload;
      
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

      // Verify customer exists
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.userId, decoded.userId))
        .limit(1);

      if (!customer || !customer.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Customer account not found or inactive',
        });
      }

      req.user = {
        userId: user.id,
        customerId: customer.id,
        email: user.email,
        role: 'customer',
      };

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

// Optional auth middleware - doesn't fail if no token, just adds user if present
export async function optionalCustomerAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as CustomerPayload;
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user && user.isActive && user.role === 'customer') {
        const [customer] = await db
          .select()
          .from(customers)
          .where(eq(customers.userId, decoded.userId))
          .limit(1);

        if (customer && customer.isActive) {
          req.user = {
            userId: user.id,
            customerId: customer.id,
            email: user.email,
            role: 'customer',
          };
        }
      }
    } catch {
      // Token invalid, continue without auth
    }

    next();
  } catch (error) {
    next();
  }
}
