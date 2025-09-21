/**
 * User Repository Implementation
 * Infrastructure layer - implements the UserRepository interface
 */

import { UserRepository } from '@/core/repositories/AuthRepository';
import { User, UserRegistrationData, UserInvitation } from '@/core/entities/User';
import { RepositoryError } from '@/core/repositories/AuthRepository';
import { ApiService } from './ApiService';

export class ApiUserRepository implements UserRepository {
  constructor(private apiService: ApiService) {}

  async getUserById(id: string, tenantId?: string): Promise<User | null> {
    try {
      if (tenantId) {
        // Note: tenantId handling removed as per requirements
      }

      const response = await this.apiService.getUserById(id);
      
      if (response.error) {
        throw new RepositoryError(
          response.error,
          'getUserById',
          new Error(response.error)
        );
      }

      if (!response.data) {
        return null;
      }

      // Transform API response to User entity
      return this.transformApiUserToEntity(response.data);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        'Failed to fetch user by ID',
        'getUserById',
        error as Error
      );
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      // This would need to be implemented based on your API
      // For now, return null as the API doesn't seem to have this endpoint
      return null;
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch user by username',
        'getUserByUsername',
        error as Error
      );
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // This would need to be implemented based on your API
      // For now, return null as the API doesn't seem to have this endpoint
      return null;
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch user by email',
        'getUserByEmail',
        error as Error
      );
    }
  }

  async createUser(userData: UserRegistrationData): Promise<User> {
    try {
      const response = await this.apiService.registerUser(userData);
      
      if (response.error) {
        throw new RepositoryError(
          response.error,
          'createUser',
          new Error(response.error)
        );
      }

      return this.transformApiUserToEntity(response.data);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        'Failed to create user',
        'createUser',
        error as Error
      );
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await this.apiService.updateUserProfile(userData);
      
      if (response.error) {
        throw new RepositoryError(
          response.error,
          'updateUser',
          new Error(response.error)
        );
      }

      return this.transformApiUserToEntity(response.data);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        'Failed to update user',
        'updateUser',
        error as Error
      );
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await this.apiService.delete(`/v1/accounts/${id}`);
      
      if (response.error) {
        throw new RepositoryError(
          response.error,
          'deleteUser',
          new Error(response.error)
        );
      }
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        'Failed to delete user',
        'deleteUser',
        error as Error
      );
    }
  }

  async inviteUser(invitation: UserInvitation, tenantId?: string): Promise<User> {
    try {
      if (tenantId) {
        // Note: tenantId handling removed as per requirements
      }

      const response = await this.apiService.inviteUser(invitation);
      
      if (response.error) {
        throw new RepositoryError(
          response.error,
          'inviteUser',
          new Error(response.error)
        );
      }

      return this.transformApiUserToEntity(response.data);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      throw new RepositoryError(
        'Failed to invite user',
        'inviteUser',
        error as Error
      );
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      // This would need to be implemented based on your API
      // For now, return empty array as the API doesn't seem to have this endpoint
      return [];
    } catch (error) {
      throw new RepositoryError(
        'Failed to search users',
        'searchUsers',
        error as Error
      );
    }
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    try {
      // This would need to be implemented based on your API
      return [];
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch users by organization',
        'getUsersByOrganization',
        error as Error
      );
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      // This would need to be implemented based on your API
      return [];
    } catch (error) {
      throw new RepositoryError(
        'Failed to fetch users by role',
        'getUsersByRole',
        error as Error
      );
    }
  }

  private transformApiUserToEntity(apiUser: any): User {
    return {
      id: apiUser.id || apiUser.sub,
      username: apiUser.username || apiUser.preferred_username,
      email: apiUser.email,
      firstName: apiUser.firstName || apiUser.given_name,
      lastName: apiUser.lastName || apiUser.family_name,
      name: apiUser.name,
      roles: apiUser.roles || apiUser.realm_access?.roles || [],
      groups: apiUser.groups || [],
      organization: apiUser.organization,
      tenantId: apiUser.tenantId,
      isActive: apiUser.isActive !== false, // Default to true if not specified
      emailVerified: apiUser.email_verified || apiUser.emailVerified || false,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
      updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : new Date(),
    };
  }
}
