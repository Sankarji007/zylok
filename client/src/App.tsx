/**
 * Main App Component - Clean Architecture
 * Presentation layer entry point
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute';
import { HomePage } from '@/presentation/pages/HomePage';
import { LoginPage } from '@/presentation/pages/LoginPage';
import { ChatPage } from '@/presentation/pages/ChatPage';
import { Toaster } from '@/components/ui/toaster';
import { AuthStatus } from '@/shared/types';
import { Loader2 } from 'lucide-react';

function App() {
  const { isAuthenticated, status } = useAuth();

  // Show loading screen during initial auth check
  if (status === AuthStatus.LOADING) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Loading Zylo</h2>
            <p className="text-slate-600">Please wait while we set things up...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:userId" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global toast notifications */}
      <Toaster />
    </div>
  );
}

export default App;