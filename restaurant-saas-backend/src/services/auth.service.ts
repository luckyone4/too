/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

import { userRepository } from '../models';
import { generateToken } from '../middleware/auth';
import { User, UserRole, AuthResponse, RegisterUserDTO, LoginDTO, JWTPayload } from '../types';
import { ValidationError, UnauthorizedError, ConflictError } from '../middleware/errorHandler';
import { validatePassword } from '../utils/validation';
import { sanitizeUser, generateId } from '../utils/helpers';

/**
 * Register new user
 */
export async function registerUser(data: RegisterUserDTO): Promise<AuthResponse> {
  // Check if email already exists
  const existingUser = userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new ValidationError(passwordValidation.errors.join(', '));
  }

  // Create user
  const user = userRepository.create({
    email: data.email,
    password: data.password, // In production, this should be hashed
    name: data.name,
    role: data.role || UserRole.STAFF,
    restaurantId: data.restaurantId,
  });

  // Generate token
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
  };
  const token = generateToken(payload);

  // Return response (remove password)
  const userWithoutPassword = sanitizeUser(user);
  return {
    token,
    user: userWithoutPassword as Omit<User, 'password'>,
  };
}

/**
 * Login user
 */
export async function loginUser(data: LoginDTO): Promise<AuthResponse> {
  // Find user
  const user = userRepository.findByEmail(data.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check password (in production, compare hashed passwords)
  if (user.password !== data.password) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new UnauthorizedError('Account is not active');
  }

  // Generate token
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
  };
  const token = generateToken(payload);

  // Return response
  const userWithoutPassword = sanitizeUser(user);
  return {
    token,
    user: userWithoutPassword as Omit<User, 'password'>,
  };
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
  const user = userRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return sanitizeUser(user) as Omit<User, 'password'>;
}

/**
 * Update user password
 */
export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = userRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Verify current password
  if (user.password !== currentPassword) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new ValidationError(passwordValidation.errors.join(', '));
  }

  // Update password (in production, hash the new password)
  userRepository.update(userId, { password: newPassword });
}

/**
 * Get all users for a restaurant
 */
export async function getRestaurantUsers(restaurantId: string): Promise<Omit<User, 'password'>[]> {
  const users = userRepository.findByRestaurant(restaurantId);
  return users.map((u) => sanitizeUser(u) as Omit<User, 'password'>);
}