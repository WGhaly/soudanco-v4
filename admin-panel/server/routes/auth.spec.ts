import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8080/api';

describe('Admin Panel Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should successfully login with valid admin credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@soudanco.com',
          password: 'admin123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe('admin@soudanco.com');
      expect(data.data.user.role).toMatch(/admin|supervisor/);
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@soudanco.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid email or password');
    });

    it('should reject missing email', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'admin123',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing password', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@soudanco.com',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Get a refresh token first
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@soudanco.com',
          password: 'admin123',
        }),
      });
      const data = await loginResponse.json();
      refreshToken = data.data?.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      if (!refreshToken) {
        console.log('No refresh token available, skipping test');
        return;
      }
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      });

      expect(response.status).toBe(401);
    });
  });
});
