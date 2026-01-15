import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthFetch } from '@/lib/auth';

// Addresses
export interface Address {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export function useAddresses() {
  const authFetch = useAuthFetch();
  
  return useQuery<{ success: boolean; data: Address[] }>({
    queryKey: ['addresses'],
    queryFn: async () => {
      return authFetch('/api/profile/addresses');
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (data: Omit<Address, 'id'>) => {
      return authFetch('/api/profile/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Address) => {
      return authFetch(`/api/profile/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return authFetch(`/api/profile/addresses/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

// Payment Methods
export interface PaymentMethod {
  id: string;
  type: 'credit' | 'bank_transfer' | 'cash';
  label: string;
  cardNumber?: string;
  cardholderName?: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export function usePaymentMethods() {
  const authFetch = useAuthFetch();
  
  return useQuery<{ success: boolean; data: PaymentMethod[] }>({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      return authFetch('/api/profile/payment-methods');
    },
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (data: { 
      type: 'credit' | 'bank_transfer' | 'cash'; 
      label: string; 
      cardNumber?: string;
      cardholderName?: string;
      lastFour?: string; 
      expiryDate?: string; 
      isDefault?: boolean 
    }) => {
      // Transform to backend format - details as JSON object
      const payload = {
        type: data.type,
        label: data.label,
        isDefault: data.isDefault || false,
        details: {
          cardNumber: data.cardNumber,
          cardholderName: data.cardholderName,
          lastFour: data.lastFour,
          expiryDate: data.expiryDate
        },
      };
      return authFetch('/api/profile/payment-methods', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return authFetch(`/api/profile/payment-methods/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return authFetch(`/api/profile/payment-methods/${id}/set-default`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
  });
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const authFetch = useAuthFetch();
  
  return useQuery<{ success: boolean; data: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      return authFetch('/api/profile/notifications');
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return authFetch(`/api/profile/notifications/${id}/read`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async () => {
      return authFetch('/api/profile/notifications/read-all', {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Dashboard
export interface DashboardStats {
  // Credit info
  creditLimit: string;
  currentBalance: string;
  walletBalance: string;
  availableCredit: string;
  // Order info
  totalOrders: number;
  pendingOrders: number;
  totalSpent: string;
  // Discounts
  activeDiscounts: number;
  // Recent orders
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    createdAt: string;
  }>;
}

export function useDashboard() {
  const authFetch = useAuthFetch();
  
  return useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      return authFetch('/api/profile/dashboard');
    },
  });
}

// Wallet Top-up
export interface WalletTopUpResponse {
  paymentId: string;
  paymentNumber: string;
  amount: number;
  creditPaid: number;
  walletAdded: number;
  newCreditUsed: number;
  newWalletBalance: number;
}

export function useWalletTopUp() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation<{ success: boolean; data: WalletTopUpResponse }, Error, { amount: number; paymentMethod?: string }>({
    mutationFn: async ({ amount, paymentMethod = 'credit' }) => {
      return authFetch('/api/profile/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod }),
      });
    },
    onSuccess: () => {
      // Invalidate dashboard to refresh balances
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Customer Discounts
export interface CustomerDiscount {
  id: string;
  discountId: string;
  discountName: string;
  discountType: 'percentage' | 'fixed' | 'category' | 'product';
  discountValue: string;
  appliesTo?: string;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
}

export function useCustomerDiscounts() {
  const authFetch = useAuthFetch();
  
  return useQuery<{ success: boolean; data: CustomerDiscount[] }>({
    queryKey: ['customerDiscounts'],
    queryFn: async () => {
      return authFetch('/api/profile/discounts');
    },
  });
}
