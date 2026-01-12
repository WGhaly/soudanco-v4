import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'customer';
  customerId?: string;
  supervisorId?: string;
  businessName?: string;
  businessNameAr?: string;
  contactName?: string;
  name?: string;
  nameAr?: string;
  phone?: string;
  region?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Token storage keys
const ACCESS_TOKEN_KEY = 'soudanco_access_token';
const USER_KEY = 'soudanco_user';

// Auth Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!accessToken;

  // Verify token on mount
  useEffect(() => {
    async function verifyAuth() {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.data);
            localStorage.setItem(USER_KEY, JSON.stringify(data.data));
          }
        } else if (response.status === 401) {
          // Try to refresh token
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  function clearAuth() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // For cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setAccessToken(data.data.accessToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, data.data.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.data.accessToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, data.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
export function RequireAuth({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode; 
  allowedRoles?: ('admin' | 'supervisor' | 'customer')[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
