import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  addressId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  total: string;
  notes?: string;
  paymentMethod?: string;
  paidAmount: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    businessName: string;
    businessNameAr?: string;
    phone?: string;
  };
  items?: OrderItem[];
  address?: {
    id: string;
    label: string;
    street: string;
    city: string;
  };
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

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export function useOrders(page = 1, limit = 10, filters?: { status?: string; customerId?: string }) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append('status', filters.status);
  if (filters?.customerId) params.append('customerId', filters.customerId);

  return useQuery<OrdersResponse>({
    queryKey: ['orders', page, limit, filters],
    queryFn: () => fetchWithAuth(`/api/orders?${params}`),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<{ success: boolean; data: Order }>({
    queryKey: ['order', id],
    queryFn: () => fetchWithAuth(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      customerId: string;
      addressId?: string;
      items: { productId: string; quantity: number; unitPrice?: number }[];
      notes?: string;
      paymentMethod?: string;
    }) =>
      fetchWithAuth('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      fetchWithAuth(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

// Helper to get status color
export function getOrderStatusColor(status: Order['status']) {
  const colors: Record<Order['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Helper to get status label in Arabic
export function getOrderStatusLabel(status: Order['status']) {
  const labels: Record<Order['status'], string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
}
