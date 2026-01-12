import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'supervisor' | 'customer';
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
}

export function requireRole(...roles: ('admin' | 'supervisor' | 'customer')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}

export function requireSupervisor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole('admin', 'supervisor')(req, res, next);
}
