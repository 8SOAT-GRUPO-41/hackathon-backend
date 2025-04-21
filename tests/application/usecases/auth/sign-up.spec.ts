import { SignUp } from '@/application/usecases/auth/sign-up';
import { User } from '@/domain/entities/user';
import { ConflictError } from '@/domain/errors';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

jest.mock('@/domain/entities/user');
jest.mock('@/domain/value-objects/user-password');
jest.mock('@/domain/value-objects/user-email');

describe('SignUp UseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let signUp: SignUp;
  let mockUser: User;
  let mockPassword: UserPassword;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPassword = {
      compare: jest.fn(),
    } as unknown as jest.Mocked<UserPassword>;

    // Create a new mock email factory instead of a single instance
    const createMockEmail = (emailValue: string) => ({
      value: emailValue,
    });

    mockUser = {
      id: 'user-123',
      email: createMockEmail('test@example.com'),
      password: mockPassword,
    } as unknown as jest.Mocked<User>;

    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    // Mock UserEmail constructor to return a new mock email with the right value
    (UserEmail as jest.Mock).mockImplementation((email) => createMockEmail(email));

    (UserPassword.create as jest.Mock).mockResolvedValue(mockPassword);
    (User.create as jest.Mock).mockReturnValue(mockUser);

    signUp = new SignUp(userRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a new user successfully', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(undefined);

    // Act
    const result = await signUp.execute(input);

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).toHaveBeenCalledWith(input.password);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ value: input.email }),
      mockPassword,
    );
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    expect(result).toBe(mockUser);
  });

  it('should throw ConflictError if user already exists', async () => {
    // Arrange
    const input = {
      email: 'existing@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);

    // Act & Assert
    await expect(signUp.execute(input)).rejects.toThrow(new ConflictError('User already exists'));
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate errors from UserPassword.create', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'weak',
    };

    const mockError = new Error('Password does not meet complexity requirements');
    userRepository.findByEmail.mockResolvedValue(null);
    (UserPassword.create as jest.Mock).mockRejectedValue(mockError);

    // Act & Assert
    await expect(signUp.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).toHaveBeenCalledWith(input.password);
    expect(User.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate errors from UserEmail constructor', async () => {
    // Arrange
    const input = {
      email: 'invalid-email',
      password: 'password123',
    };

    const mockError = new Error('Invalid email address');
    userRepository.findByEmail.mockResolvedValue(null);
    (UserEmail as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(signUp.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(User.create).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate errors from repository.save', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Database error');
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockRejectedValue(mockError);

    // Act & Assert
    await expect(signUp.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(UserPassword.create).toHaveBeenCalledWith(input.password);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ value: input.email }),
      mockPassword,
    );
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
  });
});
