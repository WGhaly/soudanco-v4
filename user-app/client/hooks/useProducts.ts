import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useAuthFetch } from '@/lib/auth';

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  categoryName?: string;
  categoryNameAr?: string;
  basePrice: string;
  price: string;
  hasCustomPrice: boolean;
  unit: string;
  unitsPerCase: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQuantity: number;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  imageUrl?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProductsFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useProducts(filters: ProductsFilters = {}) {
  const { accessToken } = useAuth();
  
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.category) queryParams.set('category', filters.category);
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.page) queryParams.set('page', filters.page.toString());
  if (filters.limit) queryParams.set('limit', filters.limit.toString());
  if (filters.sort) queryParams.set('sort', filters.sort);
  if (filters.order) queryParams.set('order', filters.order);

  return useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`/api/products?${queryParams.toString()}`, {
        headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
  });
}

export function useProduct(id: string | undefined) {
  const { accessToken } = useAuth();
  
  return useQuery<{ success: boolean; data: Product }>({
    queryKey: ['product', id],
    queryFn: async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`/api/products/${id}`, {
        headers,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/products/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      return response.json();
    },
  });
}
