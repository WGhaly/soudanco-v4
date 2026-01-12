import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  orderId?: string;
  amount: string;
  method: 'cash' | 'bank_transfer' | 'credit';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    businessName: string;
    businessNameAr?: string;
    phone?: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    total?: string;
  };
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
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

export function usePayments(page = 1, limit = 10, filters?: { status?: string; customerId?: string }) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append('status', filters.status);
  if (filters?.customerId) params.append('customerId', filters.customerId);

  return useQuery<PaymentsResponse>({
    queryKey: ['payments', page, limit, filters],
    queryFn: () => fetchWithAuth(`/api/payments?${params}`),
  });
}

export function usePayment(id: string | undefined) {
  return useQuery<{ success: boolean; data: Payment }>({
    queryKey: ['payment', id],
    queryFn: () => fetchWithAuth(`/api/payments/${id}`),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      customerId: string;
      orderId?: string;
      amount: number;
      method: Payment['method'];
      notes?: string;
    }) =>
      fetchWithAuth('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Payment['status'] }) =>
      fetchWithAuth(`/api/payments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', variables.id] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/payments/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Helper to get payment method label in Arabic
export function getPaymentMethodLabel(method: Payment['method']) {
  const labels: Record<Payment['method'], string> = {
    cash: 'نقدي',
    bank_transfer: 'تحويل بنكي',
    credit: 'آجل',
  };
  return labels[method] || method;
}

// Helper to get status color
export function getPaymentStatusColor(status: Payment['status']) {
  const colors: Record<Payment['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Helper to get status label in Arabic
export function getPaymentStatusLabel(status: Payment['status']) {
  const labels: Record<Payment['status'], string> = {
    pending: 'قيد الانتظار',
    completed: 'مكتمل',
    failed: 'فشل',
    refunded: 'مسترد',
  };
  return labels[status] || status;
}
