"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData?: { full_name?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: { email?: string; user_metadata?: { full_name?: string; phone?: string; avatar_url?: string } }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set mounted to true after first render to prevent hydration mismatch
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only check authentication after component has mounted on client
    if (mounted) {
      checkAuthentication();
    }
  }, [mounted]);

  const checkAuthentication = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Clear invalid tokens
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const loginResponse = await apiClient.login(email, password);
      
      const loggedInUser = loginResponse.user;
      
      setUser(loggedInUser);
      
      // Wait a moment for state to update before redirecting
      setTimeout(() => {
        router.push('/');
      }, 100);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    userData?: { full_name?: string; phone?: string }
  ) => {
    try {
      setLoading(true);
      const { user: registeredUser, session } = await apiClient.register(email, password, userData);
      
      if (session) {
        // Auto-login after registration
        setUser(registeredUser);
        router.push('/');
      } else {
        // Registration successful but requires email verification
        router.push('/login?message=Please check your email to verify your account');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = async (data: {
    email?: string;
    user_metadata?: { full_name?: string; phone?: string; avatar_url?: string };
  }) => {
    try {
      const updatedUser = await apiClient.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading: loading || !mounted, // Keep loading true until mounted to prevent hydration issues
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && apiClient.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 