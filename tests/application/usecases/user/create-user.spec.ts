import { CreateUser } from '@/application/usecases/user/create-user';
import { User } from '@/domain/entities/user';
import { ConflictError } from '@/domain/errors/conflict-error';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

jest.mock('@/domain/value-objects/user-password', () => ({
  UserPassword: {
    create: jest.fn(),
    fromHash: jest.fn(),
  },
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('CreateUser UseCase', () => {
  const mockDate = new Date('2023-01-01');
  let userRepository: jest.Mocked<IUserRepository>;
  let createUser: CreateUser;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    createUser = new CreateUser(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw ConflictError when user with email already exists', async () => {
    // Arrange
    const input = {
      email: 'existing@example.com',
      password: 'password123',
    };

    const existingUser = new User(
      'existing-user-id',
      new UserEmail(input.email),
      { value: 'existing-hash' } as UserPassword,
      mockDate,
    );

    userRepository.findByEmail.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(createUser.execute(input)).rejects.toThrow(ConflictError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if repository findByEmail fails', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Database error');
    userRepository.findByEmail.mockRejectedValue(mockError);

    // Act & Assert
    await expect(createUser.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error if password hashing fails', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Hashing error');
    userRepository.findByEmail.mockResolvedValue(null);
    jest.mocked(UserPassword.create).mockRejectedValue(mockError);

    // Act & Assert
    await expect(createUser.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).toHaveBeenCalledWith(input.password);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should create a new user when email does not exist', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockHashedPassword = { value: 'hashed-password' } as UserPassword;
    jest.mocked(UserPassword.create).mockResolvedValue(mockHashedPassword);

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(undefined);

    // Act
    await createUser.execute(input);

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).toHaveBeenCalledWith(input.password);
    expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
  });
});
