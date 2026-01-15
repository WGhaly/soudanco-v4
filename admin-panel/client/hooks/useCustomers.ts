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
export interface Customer {
  id: string;
  businessName: string;
  businessNameAr?: string;
  contactName: string;
  phone: string;
  email?: string;
  creditLimit: string;
  currentBalance: string;
  totalOrders: number;
  totalSpent: string;
  isActive: boolean;
  createdAt: string;
  priceListId?: string;
  supervisorId?: string;
  priceList?: {
    id: string;
    name: string;
    nameAr?: string;
  };
  supervisor?: {
    id: string;
    name: string;
    nameAr?: string;
  };
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CustomerResponse {
  success: boolean;
  data: Customer;
}

interface CreateCustomerData {
  email: string;
  password: string;
  businessName: string;
  businessNameAr?: string;
  contactName: string;
  phone: string;
  priceListId?: string;
  supervisorId?: string;
  creditLimit?: string;
  address?: {
    label: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
}

interface UpdateCustomerData {
  businessName?: string;
  businessNameAr?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  priceListId?: string;
  supervisorId?: string;
  creditLimit?: string;
  isActive?: boolean;
}

// Fetch all customers
async function fetchCustomers(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<CustomersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/customers?${searchParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}

// Fetch single customer
async function fetchCustomer(id: string): Promise<CustomerResponse> {
  const response = await fetch(`/api/customers/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customer');
  }

  return response.json();
}

// Create customer
async function createCustomer(data: CreateCustomerData): Promise<CustomerResponse> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create customer');
  }

  return result;
}

// Update customer
async function updateCustomer({ id, data }: { id: string; data: UpdateCustomerData }): Promise<CustomerResponse> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update customer');
  }

  return result;
}

// Delete customer
async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to delete customer');
  }
}

// Hooks
export function useCustomers(params?: { search?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
  });
}

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.data.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
