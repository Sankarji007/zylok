/**
 * Protected Route Component with shadcn/ui
 * Presentation layer - Clean Architecture
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { AuthStatus } from '@/shared/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading, status } = useAuth();

  // Show loading state
  if (isLoading || status === AuthStatus.LOADING) {
    return fallback || (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-slate-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || status === AuthStatus.UNAUTHENTICATED) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRole && user) {
    const hasRequiredRole = user.roles.includes(requiredRole);
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-slate-600">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-slate-500">
              Required role: <code className="bg-slate-100 px-2 py-1 rounded">{requiredRole}</code>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
