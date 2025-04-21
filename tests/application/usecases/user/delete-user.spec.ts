import { DeleteUser } from '@/application/usecases/user/delete-user';
import { User } from '@/domain/entities/user';
import { NotFoundError } from '@/domain/errors/not-found-error';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

describe('DeleteUser UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let userRepository: jest.Mocked<IUserRepository>;
  let deleteUser: DeleteUser;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    deleteUser = new DeleteUser(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should delete a user when found', async () => {
    // Arrange
    const userId = 'user-123';
    const mockEmail = new UserEmail('test@example.com');
    const mockPassword = { value: 'hashedpassword' } as UserPassword;
    const mockUser = new User(userId, mockEmail, mockPassword, mockDate);

    userRepository.findById.mockResolvedValue(mockUser);
    userRepository.delete.mockResolvedValue(undefined);

    // Act
    await deleteUser.execute({ userId });

    // Assert
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).toHaveBeenCalledWith(mockUser);
  });

  it('should throw NotFoundError when user is not found', async () => {
    // Arrange
    const userId = 'non-existent-user';
    userRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(deleteUser.execute({ userId })).rejects.toThrow(NotFoundError);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw error if repository findById fails', async () => {
    // Arrange
    const userId = 'user-123';
    const mockError = new Error('Database error');
    userRepository.findById.mockRejectedValue(mockError);

    // Act & Assert
    await expect(deleteUser.execute({ userId })).rejects.toThrow(mockError);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw error if repository delete operation fails', async () => {
    // Arrange
    const userId = 'user-123';
    const mockEmail = new UserEmail('test@example.com');
    const mockPassword = { value: 'hashedpassword' } as UserPassword;
    const mockUser = new User(userId, mockEmail, mockPassword, mockDate);
    const mockError = new Error('Delete operation failed');

    userRepository.findById.mockResolvedValue(mockUser);
    userRepository.delete.mockRejectedValue(mockError);

    // Act & Assert
    await expect(deleteUser.execute({ userId })).rejects.toThrow(mockError);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.delete).toHaveBeenCalledWith(mockUser);
  });
});
