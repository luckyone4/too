/**
 * Authentication Service Unit Tests
 */

import { userRepository } from '../../src/models';
import * as authService from '../../src/services/auth.service';
import { UserRole, UserStatus } from '../../src/types';

// Mock dependencies
jest.mock('../../src/models', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/middleware/auth', () => ({
  generateToken: jest.fn(() => 'mock_token'),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should throw conflict error if email exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockReturnValue({
        id: 'user_1',
        email: 'test@example.com',
      });

      await expect(authService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })).rejects.toThrow('Email already registered');
    });

    it('should create user successfully', async () => {
      const mockUser = {
        id: 'user_new',
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: UserRole.STAFF,
        status: UserStatus.ACTIVE,
      };

      (userRepository.findByEmail as jest.Mock).mockReturnValue(null);
      (userRepository.create as jest.Mock).mockReturnValue(mockUser);

      const result = await authService.registerUser({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.token).toBe('mock_token');
      expect(result.user.email).toBe('new@example.com');
    });
  });

  describe('loginUser', () => {
    it('should throw error if user not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockReturnValue(null);

      await expect(authService.loginUser({
        email: 'nonexistent@example.com',
        password: 'password123',
      })).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password incorrect', async () => {
      (userRepository.findByEmail as jest.Mock).mockReturnValue({
        id: 'user_1',
        email: 'test@example.com',
        password: 'correct_password',
        status: UserStatus.ACTIVE,
      });

      await expect(authService.loginUser({
        email: 'test@example.com',
        password: 'wrong_password',
      })).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if user inactive', async () => {
      (userRepository.findByEmail as jest.Mock).mockReturnValue({
        id: 'user_1',
        email: 'test@example.com',
        password: 'password123',
        status: UserStatus.INACTIVE,
      });

      await expect(authService.loginUser({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow('Account is not active');
    });

    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      };

      (userRepository.findByEmail as jest.Mock).mockReturnValue(mockUser);

      const result = await authService.loginUser({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock_token');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('getUserProfile', () => {
    it('should throw error if user not found', async () => {
      (userRepository.findById as jest.Mock).mockReturnValue(null);

      await expect(authService.getUserProfile('user_999')).rejects.toThrow('User not found');
    });

    it('should return user profile without password', async () => {
      const mockUser = {
        id: 'user_1',
        email: 'test@example.com',
        password: 'secret',
        name: 'Test User',
      };

      (userRepository.findById as jest.Mock).mockReturnValue(mockUser);

      const result = await authService.getUserProfile('user_1');

      expect(result.password).toBeUndefined();
      expect(result.email).toBe('test@example.com');
    });
  });
});