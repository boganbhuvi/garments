import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  verifyAuthToken,
  ROLE_PERMISSIONS,
  canAccessBranch,
} from '../server/middleware/auth';
import { escapeRegex } from '../server/index';

describe('Security & RBAC Unit Tests', () => {
  it('hashes and verifies passwords securely using bcryptjs', async () => {
    const hash = await hashPassword('Giriraj@2025');
    expect(hash).not.toBe('Giriraj@2025');
    expect(await verifyPassword('Giriraj@2025', hash)).toBe(true);
    expect(await verifyPassword('WrongPass', hash)).toBe(false);
  });

  it('signs and verifies JWT tokens and rejects tampered tokens', () => {
    const token = signAuthToken({
      userId: 'USR-1',
      username: 'frontdesk1',
      fullName: 'Front Desk Staff',
      role: 'FRONT_DESK',
      branchIds: ['BR-001'],
      tokenVersion: 0,
    });
    const decoded = verifyAuthToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.role).toBe('FRONT_DESK');
    expect(verifyAuthToken(token + 'tamper')).toBeNull();
  });

  it('enforces RBAC permission matrix across roles', () => {
    expect(ROLE_PERMISSIONS.SUPER_ADMIN.admin).toBe(true);
    expect(ROLE_PERMISSIONS.FRONT_DESK.create).toBe(true);
    expect(ROLE_PERMISSIONS.FRONT_DESK.deleteArchive).toBe(false);
    expect(ROLE_PERMISSIONS.CUTTING.production).toBe(true);
    expect(ROLE_PERMISSIONS.CUTTING.financial).toBe(false);
    expect(ROLE_PERMISSIONS.ACCOUNTS.financial).toBe(true);
    expect(ROLE_PERMISSIONS.CUSTOMER.read).toBe(false);
    expect(ROLE_PERMISSIONS.CUSTOMER.admin).toBe(false);
  });

  it('enforces branch-level isolation for non-global roles', () => {
    const branchManager = {
      userId: 'U2',
      username: 'bm1',
      fullName: 'BM',
      role: 'BRANCH_MANAGER' as const,
      branchIds: ['BR-001'],
      tokenVersion: 0,
    };
    expect(canAccessBranch(branchManager, 'BR-001')).toBe(true);
    expect(canAccessBranch(branchManager, 'BR-002')).toBe(false);

    const owner = { ...branchManager, role: 'OWNER' as const };
    expect(canAccessBranch(owner, 'BR-002')).toBe(true);
  });

  it('escapes regex special characters safely to prevent ReDoS/SyntaxError', () => {
    const escaped = escapeRegex('+91 (044) [test].*');
    expect(() => new RegExp(escaped, 'i')).not.toThrow();
    expect(new RegExp(escaped, 'i').test('+91 (044) [test].*')).toBe(true);
  });
});
