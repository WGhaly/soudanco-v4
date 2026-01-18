import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export interface Discount {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'buy_get' | 'spend_bonus';
  value: string;
  minOrderAmount?: string;
  minQuantity?: number;
  bonusQuantity?: number;
  bonusProductId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  computedStatus?: 'active' | 'inactive' | 'scheduled' | 'expired';
  createdAt: string;
  updatedAt: string;
  products?: {
    id: string;
    sku: string;
    name: string;
    nameAr?: string;
    basePrice: string;
  }[];
}

export interface DiscountsResponse {
  success: boolean;
  data: Discount[];
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

export function useDiscounts(page = 1, limit = 10) {
  return useQuery<DiscountsResponse>({
    queryKey: ['discounts', page, limit],
    queryFn: () => fetchWithAuth(`/api/discounts?page=${page}&limit=${limit}`),
  });
}

export function useDiscount(id: string | undefined) {
  return useQuery<{ success: boolean; data: Discount }>({
    queryKey: ['discount', id],
    queryFn: () => fetchWithAuth(`/api/discounts/${id}`),
    enabled: !!id,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      nameAr?: string;
      type: Discount['type'];
      value: number;
      minQuantity?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      productIds?: string[];
    }) =>
      fetchWithAuth('/api/discounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      name?: string;
      nameAr?: string;
      type?: Discount['type'];
      value?: number;
      minQuantity?: number;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
      productIds?: string[];
    }) =>
      fetchWithAuth(`/api/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/discounts/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

// Helper to get discount type label in Arabic
export function getDiscountTypeLabel(type: Discount['type']) {
  const labels: Record<Discount['type'], string> = {
    percentage: 'نسبة مئوية',
    fixed: 'مبلغ ثابت',
    buy_get: 'اشترِ واحصل',
    spend_bonus: 'اصرف واربح',
  };
  return labels[type] || type;
}

// Helper to get status color
export function getDiscountStatusColor(status: Discount['computedStatus']) {
  const colors: Record<NonNullable<Discount['computedStatus']>, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
  };
  return status ? colors[status] : 'bg-gray-100 text-gray-800';
}

// Helper to get status label in Arabic
export function getDiscountStatusLabel(status: Discount['computedStatus']) {
  const labels: Record<NonNullable<Discount['computedStatus']>, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    scheduled: 'مجدول',
    expired: 'منتهي',
  };
  return status ? labels[status] : 'غير معروف';
}

// Format discount value for display
export function formatDiscountValue(discount: Discount) {
  if (discount.type === 'percentage') {
    return `${discount.value}%`;
  }
  return `${discount.value} ج.م`;
}
