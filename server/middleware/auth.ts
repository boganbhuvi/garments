import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export const SESSION_COOKIE_NAME = 'giriraj_session';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'giriraj_dev_jwt_secret_change_in_production';
}

export interface AuthPayload {
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  branchIds: string[];
  customerId?: string;
  tokenVersion: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export type PermissionKey =
  | 'read'
  | 'create'
  | 'update'
  | 'deleteArchive'
  | 'approve'
  | 'export'
  | 'financial'
  | 'allBranches'
  | 'inventory'
  | 'production'
  | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  SUPER_ADMIN: {
    read: true, create: true, update: true, deleteArchive: true,
    approve: true, export: true, financial: true, allBranches: true,
    inventory: true, production: true, admin: true,
  },
  OWNER: {
    read: true, create: true, update: true, deleteArchive: true,
    approve: true, export: true, financial: true, allBranches: true,
    inventory: true, production: true, admin: true,
  },
  BRANCH_MANAGER: {
    read: true, create: true, update: true, deleteArchive: true,
    approve: true, export: true, financial: true, allBranches: false,
    inventory: true, production: true, admin: false,
  },
  FRONT_DESK: {
    read: true, create: true, update: true, deleteArchive: false,
    approve: false, export: false, financial: true, allBranches: false,
    inventory: false, production: false, admin: false,
  },
  CUTTING: {
    read: true, create: false, update: true, deleteArchive: false,
    approve: false, export: false, financial: false, allBranches: false,
    inventory: false, production: true, admin: false,
  },
  STITCHING: {
    read: true, create: false, update: true, deleteArchive: false,
    approve: false, export: false, financial: false, allBranches: false,
    inventory: false, production: true, admin: false,
  },
  QC: {
    read: true, create: false, update: true, deleteArchive: false,
    approve: true, export: false, financial: false, allBranches: false,
    inventory: false, production: true, admin: false,
  },
  DISPATCH: {
    read: true, create: false, update: true, deleteArchive: false,
    approve: false, export: false, financial: true, allBranches: false,
    inventory: false, production: true, admin: false,
  },
  ACCOUNTS: {
    read: true, create: true, update: true, deleteArchive: false,
    approve: true, export: true, financial: true, allBranches: false,
    inventory: false, production: false, admin: false,
  },
  INVENTORY: {
    read: true, create: true, update: true, deleteArchive: false,
    approve: false, export: true, financial: false, allBranches: false,
    inventory: true, production: false, admin: false,
  },
  CUSTOMER: {
    read: false, create: false, update: false, deleteArchive: false,
    approve: false, export: false, financial: false, allBranches: false,
    inventory: false, production: false, admin: false,
  },
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '12h' });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  req.user = payload;
  next();
}

export function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role === 'CUSTOMER') {
    return res.status(403).json({ error: 'Forbidden: Staff access required' });
  }
  next();
}

export function requirePermission(perm: PermissionKey) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const matrix = ROLE_PERMISSIONS[req.user.role];
    if (!matrix || !matrix[perm]) {
      return res.status(403).json({ error: `Forbidden: Missing '${perm}' permission` });
    }
    next();
  };
}

export function canAccessBranch(user: AuthPayload, branchId?: string): boolean {
  if (!branchId) return true;
  if (ROLE_PERMISSIONS[user.role]?.allBranches) return true;
  return user.branchIds.includes(branchId);
}

// Simple in-memory rate limiter for brute-force & spam protection
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function createRateLimiter(maxAttempts: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || 'unknown'}:${req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many requests. Please wait before trying again.',
      });
    }

    record.count += 1;
    next();
  };
}
