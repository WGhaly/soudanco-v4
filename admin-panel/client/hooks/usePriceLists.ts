import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export interface PriceListItem {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  price: string;
}

export interface PriceList {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  isActive: boolean;
  itemCount?: number;
  items?: PriceListItem[];
  createdAt: string;
  updatedAt: string;
}

// Input type for creating/updating price list items (no id required)
export interface PriceListItemInput {
  productId: string;
  price: number;
}

// Input type for creating a price list
export interface CreatePriceListInput {
  name: string;
  nameAr?: string;
  description?: string;
  isActive?: boolean;
  items?: PriceListItemInput[];
}

// Input type for updating a price list
export interface UpdatePriceListInput extends CreatePriceListInput {
  id: string;
}

export interface PriceListsResponse {
  success: boolean;
  data: PriceList[];
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

export function usePriceLists(page = 1, limit = 10) {
  return useQuery<PriceListsResponse>({
    queryKey: ['price-lists', page, limit],
    queryFn: () => fetchWithAuth(`/api/price-lists?page=${page}&limit=${limit}`),
  });
}

export function usePriceList(id: string | undefined) {
  return useQuery<{ success: boolean; data: PriceList }>({
    queryKey: ['price-list', id],
    queryFn: () => fetchWithAuth(`/api/price-lists/${id}`),
    enabled: !!id,
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePriceListInput) =>
      fetchWithAuth('/api/price-lists', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    },
  });
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePriceListInput) =>
      fetchWithAuth(`/api/price-lists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['price-list', variables.id] });
    },
  });
}

export function useDeletePriceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/price-lists/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    },
  });
}
