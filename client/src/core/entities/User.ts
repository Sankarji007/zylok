/**
 * User Entity - Core business model
 * Following Uncle Bob's Clean Architecture principles
 */

export interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly name?: string;
  readonly roles: string[];
  readonly groups?: string[];
  readonly organization?: string;
  readonly tenantId?: string;
  readonly isActive: boolean;
  readonly emailVerified?: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserRegistrationData {
  readonly username: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly password: string;
  readonly organization: string;
}

export interface UserProfile {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly fullName: string;
  readonly avatar?: string;
  readonly roles: string[];
  readonly groups?: string[];
  readonly organization?: string;
  readonly tenantId?: string;
}

export interface UserInvitation {
  readonly username: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly password: string;
  readonly tenantId?: string;
  readonly roles?: string[];
  readonly groups?: string[];
}

// Value objects for user-related data
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email);
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }
}

export class Username {
  private constructor(private readonly value: string) {}

  static create(username: string): Username {
    if (!this.isValid(username)) {
      throw new Error('Username must be between 3 and 20 characters');
    }
    return new Username(username);
  }

  private static isValid(username: string): boolean {
    return username.length >= 3 && username.length <= 20;
  }

  toString(): string {
    return this.value;
  }
}
