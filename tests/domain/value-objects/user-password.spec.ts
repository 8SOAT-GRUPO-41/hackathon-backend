import { UserPassword } from '@/domain/value-objects/user-password';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserPassword Value Object', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create static method', () => {
    it('should create a UserPassword with a hashed value', async () => {
      const plainPassword = 'StrongPass123!';
      const hashedPassword = 'hashed_password_value';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const password = await UserPassword.create(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(password.value).toBe(hashedPassword);
    });

    it('should throw an error if password does not meet complexity requirements', async () => {
      const weakPassword = 'weak';

      await expect(UserPassword.create(weakPassword)).rejects.toThrow(
        'Password does not meet complexity requirements',
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('fromHash static method', () => {
    it('should create a UserPassword from an already hashed value', () => {
      const hashedPassword = 'already_hashed_password';

      const password = UserPassword.fromHash(hashedPassword);

      expect(password.value).toBe(hashedPassword);
    });
  });

  describe('compare method', () => {
    it('should compare plain text with the hashed password', async () => {
      const hashedPassword = 'hashed_password';
      const plainPassword = 'StrongPass123!';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const password = UserPassword.fromHash(hashedPassword);
      const result = await password.compare(plainPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const hashedPassword = 'hashed_password';
      const plainPassword = 'WrongPassword123!';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const password = UserPassword.fromHash(hashedPassword);
      const result = await password.compare(plainPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('validate static method', () => {
    it('should return true for passwords that meet complexity requirements', () => {
      const validPasswords = ['Password123!', '12345678', 'LongPassword'];

      validPasswords.forEach((password) => {
        expect(UserPassword.validate(password)).toBe(true);
      });
    });

    it('should return false for passwords that do not meet complexity requirements', () => {
      const invalidPasswords = ['', '123', 'pass'];

      invalidPasswords.forEach((password) => {
        expect(UserPassword.validate(password)).toBe(false);
      });
    });
  });
});
