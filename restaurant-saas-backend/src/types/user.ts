/**
 * User roles for access control
 */
export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

/**
 * User interface representing a system user (admin/staff)
 */
export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: UserRole;
  restaurantId: string | null; // null for super admins
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  restaurantId: string | null;
}

/**
 * Authenticated request user
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  restaurantId: string | null;
}

/**
 * Register user DTO
 */
export interface RegisterUserDTO {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  restaurantId?: string;
}

/**
 * Login DTO
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Auth response with token
 */
export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}