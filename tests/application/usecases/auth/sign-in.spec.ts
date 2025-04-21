import { SignIn } from '@/application/usecases/auth/sign-in';
import { User } from '@/domain/entities/user';
import { InvalidPasswordError, NotFoundError } from '@/domain/errors';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

describe('SignIn UseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let signIn: SignIn;
  let mockUser: jest.Mocked<User>;
  let mockEmail: jest.Mocked<UserEmail>;
  let mockPassword: jest.Mocked<UserPassword>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPassword = {
      compare: jest.fn(),
    } as unknown as jest.Mocked<UserPassword>;

    mockEmail = {
      value: 'test@example.com',
    } as unknown as jest.Mocked<UserEmail>;

    mockUser = {
      id: 'user-123',
      email: mockEmail,
      password: mockPassword,
    } as unknown as jest.Mocked<User>;

    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    signIn = new SignIn(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should sign in a user successfully', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    mockPassword.compare.mockResolvedValue(true);

    // Act
    const result = await signIn.execute(input);

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
    expect(result).toBe(mockUser);
  });

  it('should throw NotFoundError if user not found', async () => {
    // Arrange
    const input = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(signIn.execute(input)).rejects.toThrow(new NotFoundError('User not found'));
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).not.toHaveBeenCalled();
  });

  it('should throw InvalidPasswordError if password is incorrect', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    mockPassword.compare.mockResolvedValue(false);

    // Act & Assert
    await expect(signIn.execute(input)).rejects.toThrow(
      new InvalidPasswordError('Invalid password'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
  });

  it('should propagate errors from repository.findByEmail', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Database error');
    userRepository.findByEmail.mockRejectedValue(mockError);

    // Act & Assert
    await expect(signIn.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).not.toHaveBeenCalled();
  });

  it('should propagate errors from password.compare', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Bcrypt error');
    userRepository.findByEmail.mockResolvedValue(mockUser);
    mockPassword.compare.mockRejectedValue(mockError);

    // Act & Assert
    await expect(signIn.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
  });
});
