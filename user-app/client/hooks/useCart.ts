import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthFetch } from '@/lib/auth';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productNameAr?: string;
  sku: string;
  unit: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
  imageUrl?: string;
  productImage?: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQuantity: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: string;
  discount: string;
  total: string;
}

export interface AppliedDiscount {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  discountAmount: string;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
  appliedDiscounts?: AppliedDiscount[];
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

export function useCart() {
  const authFetch = useAuthFetch();
  
  return useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch('/api/cart');
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async ({ productId, quantity, isFreeItem, sourceDiscountId }: { 
      productId: string; 
      quantity: number;
      isFreeItem?: boolean;
      sourceDiscountId?: string;
    }) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, isFreeItem, sourceDiscountId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  
  return useMutation({
    mutationFn: async () => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch('/api/cart', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
