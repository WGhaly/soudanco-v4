import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthFetch } from '@/lib/auth';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameAr?: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: string;
  discountAmount: string;
  taxAmount?: string;
  total: string;
  notes?: string;
  paymentMethod?: string;
  paidAmount?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  itemCount?: number;
  addressLabel?: string;
  addressLine1?: string;
  city?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface OrdersFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export function useOrders(filters: OrdersFilters = {}) {
  const authFetch = useAuthFetch();
  
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.page) queryParams.set('page', filters.page.toString());
  if (filters.limit) queryParams.set('limit', filters.limit.toString());

  return useQuery<OrdersResponse>({
    queryKey: ['orders', filters],
    queryFn: async () => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch(`/api/orders?${queryParams.toString()}`);
    },
  });
}

export function useOrder(id: string | undefined) {
  const authFetch = useAuthFetch();
  
  return useQuery<{ success: boolean; data: Order }>({
    queryKey: ['order', id],
    queryFn: async () => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch(`/api/orders/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (data: { 
      addressId?: string; 
      paymentMethodId?: string;
      paymentType?: 'advance' | 'partial' | 'deferred';
      notes?: string;
      deliveryDate?: string;
    }) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
