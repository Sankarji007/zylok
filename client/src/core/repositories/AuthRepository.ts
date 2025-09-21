/**
 * Authentication Repository Interface - Dependency Inversion Principle
 * Following Uncle Bob's Clean Architecture principles
 */

import { User, UserRegistrationData, UserInvitation } from '../entities/User';
import { AuthSession, LoginCredentials } from '../entities/Auth';

export interface AuthRepository {
  // Authentication operations
  initialize(): Promise<boolean>;
  login(credentials?: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  register(): Promise<void>;
  
  // Session management
  getCurrentSession(): AuthSession | null;
  refreshToken(): Promise<string>;
  isAuthenticated(): boolean;
  
  // User operations
  getCurrentUser(): User | null;
  updateUserProfile(user: Partial<User>): Promise<User>;
  
  // Token management
  getAccessToken(): string | null;
  validateToken(token: string): Promise<boolean>;
  
  // Event handling
  onAuthStateChanged(callback: (session: AuthSession | null) => void): () => void;
  onTokenRefresh(callback: (token: string) => void): () => void;
}

export interface UserRepository {
  // User CRUD operations
  getUserById(id: string, tenantId?: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: UserRegistrationData): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // User invitation operations
  inviteUser(invitation: UserInvitation, tenantId?: string): Promise<User>;
  
  // User queries
  searchUsers(query: string): Promise<User[]>;
  getUsersByOrganization(organizationId: string): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
}

// Repository error types
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}
