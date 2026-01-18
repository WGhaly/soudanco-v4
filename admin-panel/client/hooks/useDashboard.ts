import { useQuery } from '@tanstack/react-query';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export interface DashboardStats {
  customerCount: number;
  pendingOrders: number;
  outstandingBalance: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  customer: {
    id: string;
    businessName: string;
    businessNameAr?: string;
  } | null;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
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

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => fetchWithAuth('/api/stats/dashboard'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Helper to get order status in Arabic
export function getOrderStatusAr(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };
  return statusMap[status] || status;
}

// Helper to format date
export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
