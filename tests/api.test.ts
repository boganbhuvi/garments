import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';
import { signAuthToken } from '../server/middleware/auth';

describe('Backend API Security & Authorization Integration Tests', () => {
  it('GET /api/health returns 200 status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects unauthenticated requests to protected ERP endpoints with 401', async () => {
    const protectedGetEndpoints = [
      '/api/auth/me',
      '/api/inventory',
      '/api/branches',
      '/api/payments',
      '/api/enquiries',
      '/api/orders',
      '/api/customers',
      '/api/customers/search',
      '/api/tailors',
      '/api/customer/me/orders',
    ];
    for (const ep of protectedGetEndpoints) {
      const res = await request(app).get(ep);
      expect(res.status).toBe(401);
    }

    const protectedPostEndpoints = ['/api/orders', '/api/customers', '/api/sync', '/api/tailors'];
    for (const ep of protectedPostEndpoints) {
      const res = await request(app).post(ep).send({});
      expect(res.status).toBe(401);
    }
  });

  it('rejects CUSTOMER role on internal ERP endpoints with 403', async () => {
    const custToken = signAuthToken({
      userId: 'USR-C1',
      username: '9876543210',
      fullName: 'Customer One',
      role: 'CUSTOMER',
      branchIds: [],
      customerId: 'C0101',
      tokenVersion: 0,
    });

    for (const ep of [
      '/api/inventory',
      '/api/branches',
      '/api/payments',
      '/api/enquiries',
      '/api/orders',
      '/api/customers',
      '/api/tailors',
    ]) {
      const res = await request(app).get(ep).set('Authorization', `Bearer ${custToken}`);
      expect(res.status).toBe(403);
    }

    const syncRes = await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${custToken}`)
      .send({ orders: [] });
    expect(syncRes.status).toBe(403);
  });

  it('rejects staff roles from customer-only /api/customer/me/orders with 403', async () => {
    const staffToken = signAuthToken({
      userId: 'USR-FD1',
      username: 'frontdesk1',
      fullName: 'Front Desk',
      role: 'FRONT_DESK',
      branchIds: ['BR-001'],
      tokenVersion: 0,
    });
    const res = await request(app)
      .get('/api/customer/me/orders')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).not.toBe(200);
    expect([403, 503]).toContain(res.status);
  });

  it('allows unauthenticated access to /api/public/track (no 401/403)', async () => {
    const res = await request(app).get('/api/public/track?q=GG-2025-001');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('rejects CUTTING role from financial and inventory endpoints with 403', async () => {
    const cuttingToken = signAuthToken({
      userId: 'USR-CUT1',
      username: 'cutter1',
      fullName: 'Master Cutter',
      role: 'CUTTING',
      branchIds: ['BR-001'],
      tokenVersion: 0,
    });

    const payRes = await request(app).get('/api/payments').set('Authorization', `Bearer ${cuttingToken}`);
    expect(payRes.status).toBe(403);

    const invRes = await request(app).get('/api/inventory').set('Authorization', `Bearer ${cuttingToken}`);
    expect(invRes.status).toBe(403);
  });

  it('blocks disallowed CORS origins', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.example.com');
    expect(res.status).toBe(500);
  });
});
