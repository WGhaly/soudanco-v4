import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { queryClient } from '@/App';

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
      try {
        // First try to refresh the token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (data.success && data.data.accessToken) {
          const newToken = data.data.accessToken;
          setAccessToken(newToken);

          // Fetch user profile with the NEW token (not the stale closure value)
          const profileResponse = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
            credentials: 'include',
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success) {
              setCustomer(profileData.data);
              setUser({
                id: profileData.data.userId,
                email: profileData.data.email || '',
                role: 'customer',
              });
            }
          }
        }
      } catch {
        // Ignore - not logged in
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

      // Update module-level token IMMEDIATELY so useAuthFetch has it right away
      setLatestAccessToken(data.data.accessToken);
      
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

    // Clear all cached data to prevent stale data on next login
    queryClient.clear();
    
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

// Helper to get fresh token after refresh
let latestAccessToken: string | null = null;

export function setLatestAccessToken(token: string | null) {
  latestAccessToken = token;
}

// Authenticated fetch helper
export function useAuthFetch() {
  const { accessToken, refreshToken, logout } = useAuth();

  // Keep the module-level token in sync
  useEffect(() => {
    setLatestAccessToken(accessToken);
  }, [accessToken]);

  return useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      const currentToken = latestAccessToken || accessToken;
      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`);
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
          // Retry request with the LATEST token from module scope
          // We need to wait a tick for the state to update
          await new Promise(resolve => setTimeout(resolve, 50));
          const freshToken = latestAccessToken;
          if (freshToken) {
            headers.set('Authorization', `Bearer ${freshToken}`);
          }
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
