/**
 * Keycloak Authentication Repository Implementation
 * Infrastructure layer - implements the AuthRepository interface
 */

import Keycloak from 'keycloak-js';
import { AuthRepository } from '@/core/repositories/AuthRepository';
import { User } from '@/core/entities/User';
import { AuthSession, AuthToken, LoginCredentials, AuthenticationError } from '@/core/entities/Auth';

export class KeycloakAuthRepository implements AuthRepository {
  private keycloak: Keycloak;
  private authStateListeners: ((session: AuthSession | null) => void)[] = [];
  private tokenRefreshListeners: ((token: string) => void)[] = [];
  private initialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  constructor(config: {
    url: string;
    realm: string;
    clientId: string;
  }) {
    this.keycloak = new Keycloak(config);
  }

  async initialize(): Promise<boolean> {
    // Prevent multiple initializations
    if (this.initialized) {
      return this.keycloak.authenticated || false;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      });

      this.initialized = true;
      this.setupTokenRefresh();
      
      // Notify listeners of initial auth state
      const session = authenticated ? this.buildAuthSession() : null;
      this.notifyAuthStateListeners(session);

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      this.initialized = true; // Mark as initialized even on failure
      throw new AuthenticationError(
        'Failed to initialize authentication service',
        'INIT_FAILED'
      );
    }
  }

  async login(credentials?: LoginCredentials): Promise<AuthSession> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      await this.keycloak.login();
      
      // After successful login, build session
      const session = this.buildAuthSession();
      this.notifyAuthStateListeners(session);
      
      return session;
    } catch (error) {
      throw new AuthenticationError(
        'Login failed',
        'LOGIN_FAILED'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await this.keycloak.logout();
      this.notifyAuthStateListeners(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw - logout should always succeed from UI perspective
    }
  }

  async register(): Promise<void> {
    try {
      await this.keycloak.register();
    } catch (error) {
      throw new AuthenticationError(
        'Registration failed',
        'REGISTRATION_FAILED'
      );
    }
  }

  getCurrentSession(): AuthSession | null {
    if (!this.initialized || !this.keycloak.authenticated) {
      return null;
    }

    return this.buildAuthSession();
  }

  async refreshToken(): Promise<string> {
    try {
      const refreshed = await this.keycloak.updateToken(70);
      
      if (refreshed && this.keycloak.token) {
        this.notifyTokenRefreshListeners(this.keycloak.token);
        return this.keycloak.token;
      }

      if (this.keycloak.token) {
        return this.keycloak.token;
      }

      throw new Error('No token available');
    } catch (error) {
      throw new AuthenticationError(
        'Failed to refresh token',
        'TOKEN_REFRESH_FAILED'
      );
    }
  }

  isAuthenticated(): boolean {
    return this.initialized && (this.keycloak.authenticated || false);
  }

  getCurrentUser(): User | null {
    if (!this.isAuthenticated() || !this.keycloak.tokenParsed) {
      return null;
    }

    const token = this.keycloak.tokenParsed as any;
    
    return {
      id: token.sub || '',
      username: token.preferred_username || '',
      email: token.email || '',
      firstName: token.given_name,
      lastName: token.family_name,
      name: token.name,
      roles: token.realm_access?.roles || [],
      groups: token.groups || [],
      organization: token.organization,
      tenantId: token.tenant_id,
      isActive: true,
      emailVerified: token.email_verified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  getCurrentUserId(): string | null {
    if (!this.isAuthenticated() || !this.keycloak.tokenParsed) {
      return null;
    }
    
    const token = this.keycloak.tokenParsed as any;
    return token.sub || null;
  }

  async updateUserProfile(user: Partial<User>): Promise<User> {
    // This would typically involve calling Keycloak admin API
    // For now, return current user as this is read-only in most Keycloak setups
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new AuthenticationError(
        'No authenticated user',
        'NO_USER'
      );
    }
    return currentUser;
  }

  getAccessToken(): string | null {
    return this.keycloak.token || null;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // In a real implementation, you might validate against Keycloak's token introspection endpoint
      return token === this.keycloak.token;
    } catch {
      return false;
    }
  }

  onAuthStateChanged(callback: (session: AuthSession | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  onTokenRefresh(callback: (token: string) => void): () => void {
    this.tokenRefreshListeners.push(callback);
    
    return () => {
      const index = this.tokenRefreshListeners.indexOf(callback);
      if (index > -1) {
        this.tokenRefreshListeners.splice(index, 1);
      }
    };
  }

  private buildAuthSession(): AuthSession {
    const user = this.getCurrentUser();
    if (!user) {
      throw new AuthenticationError('No user data available', 'NO_USER_DATA');
    }

    const token: AuthToken = {
      accessToken: this.keycloak.token || '',
      refreshToken: this.keycloak.refreshToken,
      expiresAt: new Date((this.keycloak.tokenParsed?.exp || 0) * 1000),
      tokenType: 'Bearer',
    };

    return {
      user,
      token,
      isAuthenticated: true,
      sessionId: this.keycloak.sessionId || '',
      createdAt: new Date(),
      lastActivity: new Date(),
    };
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak.authenticated) return;

    // Set up automatic token refresh
    setInterval(() => {
      this.keycloak.updateToken(70)
        .then((refreshed) => {
          if (refreshed && this.keycloak.token) {
            this.notifyTokenRefreshListeners(this.keycloak.token);
          }
        })
        .catch(() => {
          console.log('Failed to refresh token');
        });
    }, 60000); // Check every minute
  }

  private notifyAuthStateListeners(session: AuthSession | null): void {
    this.authStateListeners.forEach(listener => {
      try {
        listener(session);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  private notifyTokenRefreshListeners(token: string): void {
    this.tokenRefreshListeners.forEach(listener => {
      try {
        listener(token);
      } catch (error) {
        console.error('Error in token refresh listener:', error);
      }
    });
  }
}
