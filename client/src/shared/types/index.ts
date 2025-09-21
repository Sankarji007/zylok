/**
 * Shared Types - Common interfaces and types
 * Following Uncle Bob's Clean Architecture principles
 */

// Re-export core entities for presentation layer
export type { User, UserRegistrationData, UserProfile, UserInvitation, Email, Username } from '@/core/entities/User';
export type { AuthToken, AuthSession, LoginCredentials, AuthState } from '@/core/entities/Auth';
export { AuthStatus, AuthenticationError, AuthorizationError } from '@/core/entities/Auth';

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// User Registration Request (for API)
export interface UserRegistrationRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  organization: string;
}

// API Error Response
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

// Common UI Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Pagination
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
}

// Event types
export type EventCallback<T = any> = (data: T) => void;
export type UnsubscribeFunction = () => void;
