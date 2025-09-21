/**
 * Modern Login Page with shadcn/ui
 * Presentation layer - Clean Architecture
 */

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Users, MessageSquare } from 'lucide-react';
import { SignupForm } from '@/presentation/components/SignupForm';

export const LoginPage: React.FC = () => {
  const { login, register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Clear error when component mounts or when switching between login/signup
  useEffect(() => {
    clearError();
  }, [showSignup, clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    try {
      setIsLoginLoading(true);
      await login();
    } catch (err) {
      // Error is handled by the context
    } finally {
      setIsLoginLoading(false);
    }
  };

  if (showSignup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-3xl font-bold text-slate-900">Zylo</h1>
            </div>
            <p className="text-slate-600">Create your account to get started</p>
          </div>
          
          <SignupForm onSuccess={() => setShowSignup(false)} />
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowSignup(false)}
              className="text-sm"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-slate-900">Zylo</h1>
          </div>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        {/* Main Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-slate-600">Initializing authentication...</span>
              </div>
            )}

            {/* Login Actions */}
            {!isLoading && (
              <div className="space-y-4">
                <Button
                  onClick={handleLogin}
                  disabled={isLoginLoading}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {isLoginLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign in with Keycloak
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowSignup(true)}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create new account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Join thousands of users already using Zylo
          </p>
          <div className="flex justify-center space-x-6 text-xs text-slate-400">
            <span>✓ Secure Authentication</span>
            <span>✓ Real-time Chat</span>
            <span>✓ Team Collaboration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
