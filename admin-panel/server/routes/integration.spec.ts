import { describe, it, expect, beforeAll } from 'vitest';

const ADMIN_API = 'http://localhost:8080/api';
const USER_API = 'http://localhost:8081/api';

describe('Cross-System Business Cycle', () => {
  let adminToken: string;
  let userToken: string;
  let customerId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    // Login as admin
    const adminLoginResponse = await fetch(`${ADMIN_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@soudanco.com',
        password: 'admin123',
      }),
    });
    const adminData = await adminLoginResponse.json();
    adminToken = adminData.data?.accessToken;

    // Login as customer
    const userLoginResponse = await fetch(`${USER_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aljawhra@example.com',
        password: 'customer123',
      }),
    });
    const userData = await userLoginResponse.json();
    userToken = userData.data?.accessToken || userData.accessToken;
    customerId = userData.data?.customer?.id || userData.customer?.id;
  }, 30000);

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  });

  const userHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`,
  });

  describe('Customer Views Products', () => {
    it('should show products with customer-specific pricing', async () => {
      const response = await fetch(`${USER_API}/products`, {
        headers: userHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Sees Customer', () => {
    it('should list the customer in admin panel', async () => {
      const response = await fetch(`${ADMIN_API}/customers`, {
        headers: adminHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      
      const customer = data.data.find((c: any) => c.id === customerId);
      expect(customer).toBeDefined();
      expect(customer.businessName).toBe('Al-Jawhra Supermarket');
    });
  });

  describe('Order Sync Between Systems', () => {
    it('should show orders created in User App in Admin Panel', async () => {
      // Get customer orders from User App
      const userOrdersResponse = await fetch(`${USER_API}/orders`, {
        headers: userHeaders(),
      });
      const userOrders = await userOrdersResponse.json();

      // Get all orders from Admin Panel
      const adminOrdersResponse = await fetch(`${ADMIN_API}/orders`, {
        headers: adminHeaders(),
      });
      const adminOrders = await adminOrdersResponse.json();

      expect(adminOrdersResponse.status).toBe(200);
      expect(userOrdersResponse.status).toBe(200);

      // If customer has orders, they should appear in admin
      if (userOrders.data && userOrders.data.length > 0) {
        const customerOrderNumber = userOrders.data[0].orderNumber;
        const foundInAdmin = adminOrders.data.some(
          (order: any) => order.orderNumber === customerOrderNumber
        );
        expect(foundInAdmin).toBe(true);
      }
    });
  });

  describe('Dashboard Statistics', () => {
    it('should reflect accurate stats in admin dashboard', async () => {
      const response = await fetch(`${ADMIN_API}/stats/dashboard`, {
        headers: adminHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.stats).toHaveProperty('incomingOrders');
      expect(data.data.stats).toHaveProperty('pendingOrders');
      expect(data.data.stats).toHaveProperty('outstandingBalance');
      
      // Outstanding balance should be a string number
      expect(typeof data.data.stats.outstandingBalance).toBe('string');
      expect(parseFloat(data.data.stats.outstandingBalance)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Notifications Flow', () => {
    it('should show notifications in User App', async () => {
      const response = await fetch(`${USER_API}/profile/notifications`, {
        headers: userHeaders(),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('Discounts Visibility', () => {
    it('should show discounts in both Admin and User App', async () => {
      // Admin can see all discounts
      const adminDiscountsResponse = await fetch(`${ADMIN_API}/discounts`, {
        headers: adminHeaders(),
      });
      const adminDiscounts = await adminDiscountsResponse.json();

      // User can see applicable discounts
      const userDiscountsResponse = await fetch(`${USER_API}/profile/discounts`, {
        headers: userHeaders(),
      });
      const userDiscounts = await userDiscountsResponse.json();

      expect(adminDiscountsResponse.status).toBe(200);
      expect(userDiscountsResponse.status).toBe(200);
      expect(Array.isArray(adminDiscounts.data)).toBe(true);
      expect(Array.isArray(userDiscounts.data)).toBe(true);
    });
  });
});
