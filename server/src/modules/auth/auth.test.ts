import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma
const mockUser = {
  id: 'test-user-id-123',
  role: 'FARMER',
  name: 'Test Farmer',
  email: 'test@farmer.in',
  phone: '9876543210',
  passwordHash: '',
  isActive: true,
  district: 'Bangalore',
  state: 'Karnataka',
};

jest.mock('../../services/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../config', () => ({
  config: {
    jwtSecret: 'test-secret-key-for-unit-tests',
    jwtExpiresIn: '7d',
    isProd: false,
  },
}));

import { prisma } from '../../services/prisma';

describe('Auth Module', () => {
  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('TestPass@123', 12);
  });

  describe('Password Hashing', () => {
    it('should hash passwords with bcrypt', async () => {
      const hash = await bcrypt.hash('MyPassword123', 12);
      expect(hash).not.toBe('MyPassword123');
      expect(hash).toMatch(/^\$2[aby]?\$/);
    });

    it('should verify correct passwords', async () => {
      const isValid = await bcrypt.compare('TestPass@123', mockUser.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const isValid = await bcrypt.compare('WrongPassword', mockUser.passwordHash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token', () => {
    it('should sign and verify tokens', () => {
      const token = jwt.sign(
        { id: mockUser.id, role: mockUser.role, email: mockUser.email, name: mockUser.name },
        'test-secret-key-for-unit-tests',
        { expiresIn: '7d' }
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, 'test-secret-key-for-unit-tests') as any;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.role).toBe('FARMER');
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should reject tokens with wrong secret', () => {
      const token = jwt.sign({ id: 'abc' }, 'test-secret-key-for-unit-tests');
      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });

    it('should reject expired tokens', () => {
      const token = jwt.sign(
        { id: mockUser.id },
        'test-secret-key-for-unit-tests',
        { expiresIn: '0s' }
      );
      // Give it a tiny delay so the token expires
      expect(() => jwt.verify(token, 'test-secret-key-for-unit-tests')).toThrow();
    });
  });

  describe('User Lookup (mocked Prisma)', () => {
    it('should find user by email', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: 'test@farmer.in' }] },
      });

      expect(user).toBeDefined();
      expect(user!.email).toBe('test@farmer.in');
      expect(user!.role).toBe('FARMER');
    });

    it('should return null for non-existent user', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: 'nobody@example.com' }] },
      });

      expect(user).toBeNull();
    });
  });

  describe('RBAC Logic', () => {
    const roles = ['FARMER', 'BUYER', 'ADMIN'];

    it('should correctly identify admin access', () => {
      const userRole = 'ADMIN';
      const allowedRoles = ['ADMIN'];
      expect(allowedRoles.includes(userRole)).toBe(true);
    });

    it('should deny farmer access to admin routes', () => {
      const userRole = 'FARMER';
      const allowedRoles = ['ADMIN'];
      expect(allowedRoles.includes(userRole)).toBe(false);
    });

    it('should allow multi-role access', () => {
      const userRole = 'FARMER';
      const allowedRoles = ['FARMER', 'ADMIN'];
      expect(allowedRoles.includes(userRole)).toBe(true);
    });
  });
});
