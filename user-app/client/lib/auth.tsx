import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Customer {
  id: string;
  businessName: string;
  businessNameAr?: string;
  contactName: string;
  name?: string; // Alias for contactName
  email?: string;
  phone: string;
  creditLimit: string;
  currentBalance: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data.accessToken) {
        setAccessToken(data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const success = await refreshToken();
      if (success) {
        // Fetch user profile
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setCustomer(data.data);
              setUser({
                id: data.data.userId,
                email: data.data.email || '',
                role: 'customer',
              });
            }
          }
        } catch {
          // Ignore
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      setCustomer(data.data.customer);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore
    }

    setUser(null);
    setCustomer(null);
    setAccessToken(null);
  };

  // Set up token refresh interval
  useEffect(() => {
    if (!accessToken) return;

    // Refresh token every 14 minutes (token expires in 15)
    const interval = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        accessToken,
        isLoading,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Authenticated fetch helper
export function useAuthFetch() {
  const { accessToken, refreshToken, logout } = useAuth();

  return useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      headers.set('Content-Type', 'application/json');

      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // If unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry request
          headers.set('Authorization', `Bearer ${accessToken}`);
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          logout();
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    },
    [accessToken, refreshToken, logout]
  );
}
