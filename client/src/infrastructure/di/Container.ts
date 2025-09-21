/**
 * Dependency Injection Container
 * Following Uncle Bob's Clean Architecture principles
 */

import { AuthRepository, UserRepository } from '@/core/repositories/AuthRepository';
import { AuthUseCases } from '@/core/use-cases/AuthUseCases';
import { UserUseCases } from '@/core/use-cases/UserUseCases';
import { KeycloakAuthRepository } from '@/infrastructure/auth/KeycloakAuthRepository';
import { ApiUserRepository } from '@/infrastructure/api/UserRepository';
import { ApiService } from '@/infrastructure/api/ApiService';

// Configuration interface
export interface AppConfig {
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
  api: {
    baseURL: string;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'master',
    clientId: 'zylo-web',
  },
  api: {
    baseURL: 'http://localhost:8081/api',
  },
};

/**
 * Dependency Injection Container
 * This is where we wire up all our dependencies
 */
export class Container {
  private static instance: Container;
  private authRepository: AuthRepository;
  private userRepository: UserRepository;
  private authUseCases: AuthUseCases;
  private userUseCases: UserUseCases;
  private apiService: ApiService;

  private constructor(private config: AppConfig) {
    // Initialize repositories
    this.authRepository = new KeycloakAuthRepository(this.config.keycloak);
    
    // Initialize API service with configuration and auth repository
    this.apiService = new ApiService(this.config.api.baseURL);
    this.apiService.setAuthRepository(this.authRepository);
    
    // Initialize user repository
    this.userRepository = new ApiUserRepository(this.apiService);
    
    // Initialize use cases
    this.authUseCases = new AuthUseCases(this.authRepository);
    this.userUseCases = new UserUseCases(this.userRepository);
  }

  public static getInstance(config: AppConfig = defaultConfig): Container {
    if (!Container.instance) {
      Container.instance = new Container(config);
    }
    return Container.instance;
  }

  public static reset(): void {
    Container.instance = null as any;
  }

  // Repository getters
  public getAuthRepository(): AuthRepository {
    return this.authRepository;
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  // Use case getters
  public getAuthUseCases(): AuthUseCases {
    return this.authUseCases;
  }

  public getUserUseCases(): UserUseCases {
    return this.userUseCases;
  }

  // Service getters
  public getApiService(): ApiService {
    return this.apiService;
  }

  // Configuration getter
  public getConfig(): AppConfig {
    return this.config;
  }
}

// Convenience function to get the container instance
export const getContainer = (config?: AppConfig): Container => {
  return Container.getInstance(config);
};
