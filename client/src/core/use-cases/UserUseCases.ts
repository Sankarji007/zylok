/**
 * User Use Cases - Application Business Rules
 * Following Uncle Bob's Clean Architecture principles
 */

import { User, UserInvitation } from '../entities/User';
import { UserRepository } from '../repositories/AuthRepository';

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, tenantId?: string): Promise<User | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      return await this.userRepository.getUserById(userId, tenantId);
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class InviteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(invitation: UserInvitation, tenantId?: string): Promise<User> {
    // Validate invitation data
    this.validateInvitation(invitation);

    try {
      return await this.userRepository.inviteUser(invitation, tenantId);
    } catch (error) {
      throw new Error(`Failed to invite user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateInvitation(invitation: UserInvitation): void {
    if (!invitation.username?.trim()) {
      throw new Error('Username is required');
    }

    if (!invitation.email?.trim()) {
      throw new Error('Email is required');
    }

    if (!invitation.firstName?.trim()) {
      throw new Error('First name is required');
    }

    if (!invitation.lastName?.trim()) {
      throw new Error('Last name is required');
    }

    if (!invitation.password || invitation.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invitation.email)) {
      throw new Error('Invalid email format');
    }

    // Username validation
    if (invitation.username.length < 3 || invitation.username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }
  }
}

export class SearchUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(query: string): Promise<User[]> {
    if (!query?.trim()) {
      return [];
    }

    try {
      return await this.userRepository.searchUsers(query.trim());
    } catch (error) {
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class GetUsersByOrganizationUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(organizationId: string): Promise<User[]> {
    if (!organizationId?.trim()) {
      throw new Error('Organization ID is required');
    }

    try {
      return await this.userRepository.getUsersByOrganization(organizationId);
    } catch (error) {
      throw new Error(`Failed to get users by organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class GetUsersByRoleUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(role: string): Promise<User[]> {
    if (!role?.trim()) {
      throw new Error('Role is required');
    }

    try {
      return await this.userRepository.getUsersByRole(role);
    } catch (error) {
      throw new Error(`Failed to get users by role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Composite use case for user operations
export class UserUseCases {
  public readonly getUserById: GetUserByIdUseCase;
  public readonly inviteUser: InviteUserUseCase;
  public readonly searchUsers: SearchUsersUseCase;
  public readonly getUsersByOrganization: GetUsersByOrganizationUseCase;
  public readonly getUsersByRole: GetUsersByRoleUseCase;

  constructor(userRepository: UserRepository) {
    this.getUserById = new GetUserByIdUseCase(userRepository);
    this.inviteUser = new InviteUserUseCase(userRepository);
    this.searchUsers = new SearchUsersUseCase(userRepository);
    this.getUsersByOrganization = new GetUsersByOrganizationUseCase(userRepository);
    this.getUsersByRole = new GetUsersByRoleUseCase(userRepository);
  }
}
