// Shared authenticated fetch utility for all hooks
const ACCESS_TOKEN_KEY = 'soudanco_access_token';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  
  failedQueue = [];
};

async function refreshAccessToken(): Promise<string> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  if (data.success && data.data.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.data.accessToken);
    return data.data.accessToken;
  }
  
  throw new Error('Failed to refresh token');
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  
  // If 401, try to refresh token
  if (response.status === 401) {
    if (isRefreshing) {
      // Wait for the ongoing refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // Retry the original request with new token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${token}`,
          };
          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: newHeaders,
          }).then(res => {
            if (!res.ok) {
              throw new Error('Request failed after token refresh');
            }
            return res.json();
          });
        })
        .catch((err) => {
          throw err;
        });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      processQueue(null, newToken);
      
      // Retry original request with new token
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: newHeaders,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }
      
      return response.json();
    } catch (err) {
      isRefreshing = false;
      processQueue(err, null);
      
      // Token refresh failed, log out user
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem('soudanco_user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

