/**
 * Clean Architecture Auth Context
 * Presentation layer - uses use cases and follows dependency inversion
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/core/entities/User';
import { AuthStatus } from '@/core/entities/Auth';
import { AuthUseCases } from '@/core/use-cases/AuthUseCases';
import { getContainer } from '@/infrastructure/di/Container';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: AuthStatus;
  error: string | null;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING);
  const [error, setError] = useState<string | null>(null);

  // Get use cases and services from container
  const container = getContainer();
  const authUseCases = container.getAuthUseCases();
  const authRepository = container.getAuthRepository();
  const apiService = container.getApiService();

  useEffect(() => {
    initializeAuth();
    
    // Set up auth state listener
    const unsubscribe = authRepository.onAuthStateChanged((session) => {
      if (session) {
        setUser(session.user);
        setIsAuthenticated(session.isAuthenticated);
        setStatus(AuthStatus.AUTHENTICATED);
        // Set auth token in API service
        apiService.setAuthToken(session.token.accessToken);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setStatus(AuthStatus.UNAUTHENTICATED);
        // Clear auth token from API service
        apiService.clearAuthToken();
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setStatus(AuthStatus.LOADING);
      setError(null);

      const authenticated = await authUseCases.initialize.execute();
      
      if (authenticated) {
        const currentUser = authUseCases.getCurrentUser.execute();
        const token = authRepository.getAccessToken();
        
        setUser(currentUser);
        setIsAuthenticated(true);
        setStatus(AuthStatus.AUTHENTICATED);
        
        // Set auth token in API service
        if (token) {
          apiService.setAuthToken(token);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setStatus(AuthStatus.UNAUTHENTICATED);
        apiService.clearAuthToken();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication initialization failed';
      setError(errorMessage);
      setStatus(AuthStatus.ERROR);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const session = await authUseCases.login.execute();
      
      setUser(session.user);
      setIsAuthenticated(session.isAuthenticated);
      setStatus(AuthStatus.AUTHENTICATED);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setStatus(AuthStatus.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authUseCases.logout.execute();
      
      setUser(null);
      setIsAuthenticated(false);
      setStatus(AuthStatus.UNAUTHENTICATED);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authUseCases.register.execute();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      setStatus(AuthStatus.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    status,
    error,
    login,
    logout,
    register,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
