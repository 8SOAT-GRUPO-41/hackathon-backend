import { User } from '@/domain/entities/user';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';
import { UserRepository } from '@/infrastructure/repository/user-repository';
import prisma from '@/infrastructure/prisma';

jest.mock('@/infrastructure/prisma', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userPassword: UserPassword;
  let user: User;
  const userEmail = new UserEmail('test@example.com');

  beforeAll(async () => {
    userPassword = await UserPassword.create('Password123!');
    user = new User('user-id', userEmail, userPassword);
  });

  beforeEach(() => {
    userRepository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should call prisma.user.create with correct data', async () => {
      await userRepository.save(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: user.email.value,
          passwordHash: user.password.value,
        },
      });
    });
  });

  describe('findById', () => {
    it('should return null when user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.findById('non-existent-id');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'non-existent-id',
        },
      });
    });

    it('should return a User instance when user is found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });

      const result = await userRepository.findById('user-id');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-id');
      expect(result?.email.value).toBe('test@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-id',
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return null when user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'non-existent@example.com',
        },
      });
    });

    it('should return a User instance when user is found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-id');
      expect(result?.email.value).toBe('test@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
        },
      });
    });
  });

  describe('delete', () => {
    it('should call prisma.user.delete with correct id', async () => {
      await userRepository.delete(user);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: {
          id: user.id,
        },
      });
    });
  });
});
