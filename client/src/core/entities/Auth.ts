/**
 * Authentication Entity - Core business model for authentication
 * Following Uncle Bob's Clean Architecture principles
 */

import { User } from './User';

export interface AuthToken {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt: Date;
  readonly tokenType: 'Bearer' | 'JWT';
}

export interface AuthSession {
  readonly user: User;
  readonly token: AuthToken;
  readonly isAuthenticated: boolean;
  readonly sessionId: string;
  readonly createdAt: Date;
  readonly lastActivity: Date;
}

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly user: User | null;
  readonly token: string | null;
  readonly error: string | null;
}

// Authentication status enum
export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error'
}

// Authentication error types
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly requiredRole?: string
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
