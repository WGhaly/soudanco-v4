// Shared authenticated fetch utility for all hooks
const ACCESS_TOKEN_KEY = 'soudanco_access_token';

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  
  if (!response.ok) {
    // If 401, clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem('soudanco_user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}
