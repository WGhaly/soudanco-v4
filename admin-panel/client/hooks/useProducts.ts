import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

function getAuthHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  basePrice: string;
  unit: string;
  unitsPerCase: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    nameAr?: string;
  };
  priceListItems?: Array<{
    priceListId: string;
    price: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

interface CreateProductData {
  sku: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  basePrice: string;
  unit?: string;
  unitsPerCase?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
}

interface UpdateProductData {
  sku?: string;
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId?: string;
  basePrice?: string;
  unit?: string;
  unitsPerCase?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  isActive?: boolean;
}

// Fetch all products
async function fetchProducts(params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/products?${searchParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

// Fetch single product
async function fetchProduct(id: string): Promise<ProductResponse> {
  const response = await fetch(`/api/products/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  return response.json();
}

// Fetch categories
async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/products/categories/all', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

// Create product
async function createProduct(data: CreateProductData): Promise<ProductResponse> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create product');
  }

  return result;
}

// Update product
async function updateProduct({ id, data }: { id: string; data: UpdateProductData }): Promise<ProductResponse> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update product');
  }

  return result;
}

// Delete product
async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to delete product');
  }
}

// Hooks
export function useProducts(params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.data.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
