import { GetUserById } from '@/application/usecases/user/get-user-by-id';
import { User } from '@/domain/entities/user';
import { NotFoundError } from '@/domain/errors/not-found-error';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

describe('GetUserById UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let userRepository: jest.Mocked<IUserRepository>;
  let getUserById: GetUserById;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    getUserById = new GetUserById(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a user when found by id', async () => {
    // Arrange
    const userId = 'user-123';
    const mockEmail = new UserEmail('test@example.com');
    const mockPassword = { value: 'hashedpassword' } as UserPassword;
    const mockUser = new User(userId, mockEmail, mockPassword, mockDate);

    userRepository.findById.mockResolvedValue(mockUser);

    // Act
    const result = await getUserById.execute({ userId });

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toBe(mockUser);
    expect(result.id).toBe(userId);
    expect(result.email).toBe(mockEmail);
    expect(result.password).toBe(mockPassword);
  });

  it('should throw NotFoundError when user is not found', async () => {
    // Arrange
    const userId = 'non-existent-user';
    userRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(getUserById.execute({ userId })).rejects.toThrow(NotFoundError);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw error if repository fails', async () => {
    // Arrange
    const userId = 'user-123';
    const mockError = new Error('Database error');
    userRepository.findById.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getUserById.execute({ userId })).rejects.toThrow(mockError);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });
});
