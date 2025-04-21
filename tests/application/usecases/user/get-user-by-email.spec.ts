import { GetUserByEmail } from '@/application/usecases/user/get-user-by-email';
import { User } from '@/domain/entities/user';
import { NotFoundError } from '@/domain/errors/not-found-error';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

describe('GetUserByEmail UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let userRepository: jest.Mocked<IUserRepository>;
  let getUserByEmail: GetUserByEmail;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    getUserByEmail = new GetUserByEmail(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a user when found by email', async () => {
    // Arrange
    const userId = 'user-123';
    const email = 'test@example.com';
    const mockEmail = new UserEmail(email);
    const mockPassword = { value: 'hashedpassword' } as UserPassword;
    const mockUser = new User(userId, mockEmail, mockPassword, mockDate);

    userRepository.findByEmail.mockResolvedValue(mockUser);

    // Act
    const result = await getUserByEmail.execute({ email });

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(result).toBe(mockUser);
    expect(result.id).toBe(userId);
    expect(result.email).toBe(mockEmail);
    expect(result.password).toBe(mockPassword);
  });

  it('should throw NotFoundError when user is not found', async () => {
    // Arrange
    const email = 'nonexistent@example.com';
    userRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(getUserByEmail.execute({ email })).rejects.toThrow(NotFoundError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
  });

  it('should throw error if repository fails', async () => {
    // Arrange
    const email = 'test@example.com';
    const mockError = new Error('Database error');
    userRepository.findByEmail.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getUserByEmail.execute({ email })).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
  });
});
