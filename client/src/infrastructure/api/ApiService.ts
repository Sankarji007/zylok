/**
 * API Service - Infrastructure layer
 * Handles HTTP requests to the backend services
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { UserRegistrationRequest, UserInvitation, ApiResponse, ApiError } from '@/shared/types';
// Note: Container import removed to avoid circular dependency

export class ApiService {
  private httpClient: AxiosInstance;
  private authRepository: any = null; // Will be set by the container
  private isRefreshing = false; // Reserved for future token refresh implementation
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(baseURL: string = 'http://localhost:8081/api') {
    this.httpClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }


  public setAuthToken(token: string): void {
    // Set default header (backup)
    this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth token set in API service');
  }

  public clearAuthToken(): void {
    delete this.httpClient.defaults.headers.common['Authorization'];
    console.log('Auth token cleared from API service');
  }

  public getCurrentAuthHeader(): string | undefined {
    return this.httpClient.defaults.headers.common['Authorization'] as string;
  }

  public setAuthRepository(authRepository: any): void {
    this.authRepository = authRepository;
  }

  private setupInterceptors(): void {
    // Request interceptor - check token expiration and add headers
    this.httpClient.interceptors.request.use(
      async (config) => {
        // Check and refresh token if needed before each request
        if (this.authRepository) {
          try {
            await this.ensureValidToken();
            
            // Get current token and add to request
            const token = this.authRepository.getAccessToken();
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`;
            }
          } catch (error) {
            console.warn('Failed to ensure valid token:', error);
            // Continue with request even if token refresh fails
          }
        }

        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle common errors
    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('Unauthorized request - token may be invalid or expired');
          // Since we proactively refresh tokens, a 401 likely means the user needs to re-authenticate
        }
        
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // Reserved for future token refresh implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.authRepository) {
      console.warn('No auth repository available for token checking');
      return;
    }

    try {
      // Check if token is about to expire (within 5 minutes)
      const currentToken = this.authRepository.getAccessToken();
      if (!currentToken) {
        console.warn('No access token available');
        return;
      }

      console.log('Checking token expiration...');
      
      // Parse the token to check expiration
      const tokenPayload = this.parseJwtPayload(currentToken);
      if (!tokenPayload || !tokenPayload.exp) {
        console.warn('Unable to parse token or no expiration found');
        return;
      }

      const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const fiveMinutesInMs = 5 * 60 * 1000;
      const timeUntilExpiry = expirationTime - currentTime;

      console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);

      // If token expires within 5 minutes, refresh it
      if (timeUntilExpiry < fiveMinutesInMs) {
        console.log('Token expiring soon, refreshing...');
        const newToken = await this.authRepository.refreshToken();
        this.setAuthToken(newToken);
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      // Don't throw error, let the request proceed
    }
  }

  private parseJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.warn('Failed to parse JWT token:', error);
      return null;
    }
  }

  private handleApiError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        code: error.response.data?.code || 'UNKNOWN_ERROR',
        statusCode: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 0,
      };
    }
  }

  // Auth endpoints
  async registerUser(userData: UserRegistrationRequest): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.post('/auth/register', userData);
      return {
        data: response.data,
        message: 'Registration successful',
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async validateUser(username: string): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.get(`/auth/validate/${username}`);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.get('/users/me');
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.get(`/v1/users/${userId}`);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async getAllUsers(page: number = 0, size: number = 20): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.get(`/v1/users?page=${page}&size=${size}`);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async inviteUser(invitation: UserInvitation): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.post('/v1/accounts/admin/invite', {
        username: invitation.username,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        password: invitation.password,
      });
      return {
        data: response.data,
        message: 'User invited successfully',
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async updateUserProfile(userData: Partial<any>): Promise<ApiResponse> {
    try {
      const response = await this.httpClient.put('/users/me', userData);
      return {
        data: response.data,
        message: 'Profile updated successfully',
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.httpClient.get(endpoint);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.httpClient.post(endpoint, data);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.httpClient.put(endpoint, data);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.httpClient.delete(endpoint);
      return {
        data: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const apiError = error as ApiError;
      return {
        error: apiError.message,
        statusCode: apiError.statusCode,
      };
    }
  }
}

// Note: ApiService is now instantiated through the DI Container
