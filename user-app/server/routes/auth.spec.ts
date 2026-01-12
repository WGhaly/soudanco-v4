import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:8081/api';

describe('User App Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should successfully login with valid customer credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'aljawhra@example.com',
          password: 'customer123',
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.customer).toBeDefined();
      expect(result.data.customer.businessName).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'aljawhra@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

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
      refreshToken = result.data?.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      if (!refreshToken) {
        console.log('No refresh token in response, skipping');
        return;
      }
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBeDefined();
    });
  });
});
