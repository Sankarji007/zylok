/**
 * Authentication Use Cases - Application Business Rules
 * Following Uncle Bob's Clean Architecture principles
 */

import { User, UserRegistrationData } from '../entities/User';
import { AuthSession, AuthStatus, AuthenticationError } from '../entities/Auth';
import { AuthRepository } from '../repositories/AuthRepository';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<AuthSession> {
    try {
      const session = await this.authRepository.login();
      
      if (!session.isAuthenticated) {
        throw new AuthenticationError(
          'Login failed',
          'LOGIN_FAILED'
        );
      }

      return session;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      throw new AuthenticationError(
        'An unexpected error occurred during login',
        'LOGIN_ERROR',
        500
      );
    }
  }
}

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      // Log the error but don't throw - logout should always succeed from UI perspective
      console.error('Logout error:', error);
    }
  }
}

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.register();
    } catch (error) {
      throw new AuthenticationError(
        'Registration failed. Please try again.',
        'REGISTRATION_FAILED'
      );
    }
  }
}

export class InitializeAuthUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<boolean> {
    try {
      return await this.authRepository.initialize();
    } catch (error) {
      console.error('Auth initialization error:', error);
      return false;
    }
  }
}

export class GetCurrentUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): User | null {
    return this.authRepository.getCurrentUser();
  }
}

export class CheckAuthStatusUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): AuthStatus {
    const session = this.authRepository.getCurrentSession();
    
    if (!session) {
      return AuthStatus.UNAUTHENTICATED;
    }

    if (session.isAuthenticated) {
      return AuthStatus.AUTHENTICATED;
    }

    return AuthStatus.UNAUTHENTICATED;
  }
}

export class RefreshTokenUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<string> {
    try {
      return await this.authRepository.refreshToken();
    } catch (error) {
      throw new AuthenticationError(
        'Failed to refresh authentication token',
        'TOKEN_REFRESH_FAILED'
      );
    }
  }
}

// Composite use case for auth operations
export class AuthUseCases {
  public readonly login: LoginUseCase;
  public readonly logout: LogoutUseCase;
  public readonly register: RegisterUseCase;
  public readonly initialize: InitializeAuthUseCase;
  public readonly getCurrentUser: GetCurrentUserUseCase;
  public readonly checkAuthStatus: CheckAuthStatusUseCase;
  public readonly refreshToken: RefreshTokenUseCase;

  constructor(authRepository: AuthRepository) {
    this.login = new LoginUseCase(authRepository);
    this.logout = new LogoutUseCase(authRepository);
    this.register = new RegisterUseCase(authRepository);
    this.initialize = new InitializeAuthUseCase(authRepository);
    this.getCurrentUser = new GetCurrentUserUseCase(authRepository);
    this.checkAuthStatus = new CheckAuthStatusUseCase(authRepository);
    this.refreshToken = new RefreshTokenUseCase(authRepository);
  }
}
