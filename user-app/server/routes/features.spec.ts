import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:8081/api';

describe('User App Features API', () => {
  let accessToken: string;
  let customerId: string;

  beforeAll(async () => {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aljawhra@example.com',
        password: 'customer123',
      }),
    });
    const result = await loginResponse.json();
    accessToken = result.data?.accessToken;
    customerId = result.data?.customer?.id;
  });

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  });

  describe('GET /api/products', () => {
    it('should return products with customer-specific pricing', async () => {
      const response = await fetch(`${API_BASE}/products`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);

      const product = data.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
    });

    it('should return products without auth (base prices)', async () => {
      const response = await fetch(`${API_BASE}/products`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('GET /api/products/categories', () => {
    it('should return product categories', async () => {
      const response = await fetch(`${API_BASE}/products/categories`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Cart Operations', () => {
    it('should get cart contents', async () => {
      const response = await fetch(`${API_BASE}/cart`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('summary');
    });

    it('should require authentication for cart', async () => {
      const response = await fetch(`${API_BASE}/cart`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    it('should return customer orders', async () => {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should require authentication for orders', async () => {
      const response = await fetch(`${API_BASE}/orders`);
      expect(response.status).toBe(401);
    });
  });

  describe('Profile Endpoints', () => {
    it('should return customer addresses', async () => {
      const response = await fetch(`${API_BASE}/profile/addresses`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return customer dashboard', async () => {
      const response = await fetch(`${API_BASE}/profile/dashboard`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('customer');
      expect(data.data).toHaveProperty('stats');
    });

    it('should return customer notifications', async () => {
      const response = await fetch(`${API_BASE}/profile/notifications`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return customer discounts', async () => {
      const response = await fetch(`${API_BASE}/profile/discounts`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return payment methods', async () => {
      const response = await fetch(`${API_BASE}/profile/payment-methods`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
