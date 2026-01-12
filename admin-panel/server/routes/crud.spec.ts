import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:8080/api';

describe('Admin Panel CRUD API', () => {
  let accessToken: string;

  beforeAll(async () => {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@soudanco.com',
        password: 'admin123',
      }),
    });
    const result = await loginResponse.json();
    accessToken = result.data?.accessToken;
  });

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  });

  describe('GET /api/stats/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const response = await fetch(`${API_BASE}/stats/dashboard`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.stats).toBeDefined();
      expect(data.data.stats).toHaveProperty('incomingOrders');
      expect(data.data.stats).toHaveProperty('pendingOrders');
      expect(data.data.stats).toHaveProperty('outstandingBalance');
    });

    it('should require authentication', async () => {
      const response = await fetch(`${API_BASE}/stats/dashboard`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/customers', () => {
    it('should return list of customers', async () => {
      const response = await fetch(`${API_BASE}/customers`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      // Check customer structure
      const customer = data.data[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('businessName');
      expect(customer).toHaveProperty('phone');
    });

    it('should support pagination', async () => {
      const response = await fetch(`${API_BASE}/customers?page=1&limit=2`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/products', () => {
    it('should return list of products', async () => {
      const response = await fetch(`${API_BASE}/products`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      // Check product structure
      const product = data.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('sku');
      expect(product).toHaveProperty('basePrice');
    });
  });

  describe('GET /api/orders', () => {
    it('should return list of orders', async () => {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should include customer details in orders', async () => {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: authHeaders(),
      });

      const data = await response.json();
      if (data.data.length > 0) {
        const order = data.data[0];
        expect(order).toHaveProperty('orderNumber');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('customer');
      }
    });
  });

  describe('GET /api/payments', () => {
    it('should return list of payments', async () => {
      const response = await fetch(`${API_BASE}/payments`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('GET /api/discounts', () => {
    it('should return list of discounts', async () => {
      const response = await fetch(`${API_BASE}/discounts`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        const discount = data.data[0];
        expect(discount).toHaveProperty('id');
        expect(discount).toHaveProperty('name');
        expect(discount).toHaveProperty('type');
        expect(discount).toHaveProperty('value');
      }
    });
  });

  describe('GET /api/supervisors', () => {
    it('should return list of supervisors', async () => {
      const response = await fetch(`${API_BASE}/supervisors`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      const supervisor = data.data[0];
      expect(supervisor).toHaveProperty('id');
      expect(supervisor).toHaveProperty('name');
      expect(supervisor).toHaveProperty('phone');
    });
  });

  describe('GET /api/price-lists', () => {
    it('should return list of price lists', async () => {
      const response = await fetch(`${API_BASE}/price-lists`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      const priceList = data.data[0];
      expect(priceList).toHaveProperty('id');
      expect(priceList).toHaveProperty('name');
    });
  });
});
