import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export interface Supervisor {
  id: string;
  userId: string;
  name: string;
  nameAr?: string;
  phone: string;
  region?: string;
  assignedCustomers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface SupervisorsResponse {
  success: boolean;
  data: Supervisor[];
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

export function useSupervisors(page = 1, limit = 10, filters?: { search?: string; status?: string }) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);

  return useQuery<SupervisorsResponse>({
    queryKey: ['supervisors', page, limit, filters],
    queryFn: () => fetchWithAuth(`/api/supervisors?${params}`),
  });
}

export function useSupervisor(id: string | undefined) {
  return useQuery<{ success: boolean; data: Supervisor }>({
    queryKey: ['supervisor', id],
    queryFn: () => fetchWithAuth(`/api/supervisors/${id}`),
    enabled: !!id,
  });
}

export function useCreateSupervisor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      name: string;
      nameAr?: string;
      phone: string;
      region?: string;
      isActive?: boolean;
    }) =>
      fetchWithAuth('/api/supervisors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
    },
  });
}

export function useUpdateSupervisor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: {
      id: string;
      email?: string;
      password?: string;
      name?: string;
      nameAr?: string;
      phone?: string;
      region?: string;
      isActive?: boolean;
    }) =>
      fetchWithAuth(`/api/supervisors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      queryClient.invalidateQueries({ queryKey: ['supervisor', variables.id] });
    },
  });
}

export function useDeleteSupervisor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/supervisors/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
    },
  });
}

// Helper to get status color
export function getSupervisorStatusColor(isActive: boolean) {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
}

// Helper to get status label in Arabic
export function getSupervisorStatusLabel(isActive: boolean) {
  return isActive ? 'نشط' : 'غير نشط';
}
