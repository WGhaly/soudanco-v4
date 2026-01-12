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
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: string;
  itemCount: number;
  totalQuantity: number;
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
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      // authFetch already returns parsed JSON and handles errors
      return authFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
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
