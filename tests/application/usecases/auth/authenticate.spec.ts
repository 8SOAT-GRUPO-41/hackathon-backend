import { Authenticate } from '@/application/usecases/auth/authenticate';
import { User } from '@/domain/entities/user';
import { InvalidPasswordError, NotFoundError } from '@/domain/errors';
import { IUserRepository } from '@/domain/repository/user-repository';
import { ITokenService } from '@/domain/services/token-service';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

describe('Authenticate UseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let authenticate: Authenticate;
  let mockUser: jest.Mocked<User>;
  let mockEmail: jest.Mocked<UserEmail>;
  let mockPassword: jest.Mocked<UserPassword>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPassword = {
      compare: jest.fn().mockResolvedValue(true),
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
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    tokenService = {
      generateToken: jest.fn().mockReturnValue('mock-token'),
      generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
      verifyToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    authenticate = new Authenticate(userRepository, tokenService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should authenticate a user successfully', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Act
    const result = await authenticate.execute(input);

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
    expect(tokenService.generateToken).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        email: mockEmail.value,
      },
      '15m',
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        email: mockEmail.value,
      },
      '7d',
    );
    expect(result).toEqual({
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      userId: mockUser.id,
    });
  });

  it('should throw NotFoundError if user not found', async () => {
    // Arrange
    const input = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    userRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(authenticate.execute(input)).rejects.toThrow(
      new NotFoundError('Usuário não encontrado'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).not.toHaveBeenCalled();
    expect(tokenService.generateToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should throw InvalidPasswordError if password is incorrect', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mockPassword.compare.mockResolvedValue(false);

    // Act & Assert
    await expect(authenticate.execute(input)).rejects.toThrow(
      new InvalidPasswordError('Senha inválida'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
    expect(tokenService.generateToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
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
    await expect(authenticate.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).not.toHaveBeenCalled();
    expect(tokenService.generateToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should propagate errors from password.compare', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Bcrypt error');
    mockPassword.compare.mockRejectedValue(mockError);

    // Act & Assert
    await expect(authenticate.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
    expect(tokenService.generateToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should propagate errors from tokenService.generateToken', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Token generation error');
    tokenService.generateToken.mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(authenticate.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
    expect(tokenService.generateToken).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        email: mockEmail.value,
      },
      '15m',
    );
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should propagate errors from tokenService.generateRefreshToken', async () => {
    // Arrange
    const input = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockError = new Error('Refresh token generation error');
    tokenService.generateRefreshToken.mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(authenticate.execute(input)).rejects.toThrow(mockError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockPassword.compare).toHaveBeenCalledWith(input.password);
    expect(tokenService.generateToken).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        email: mockEmail.value,
      },
      '15m',
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        email: mockEmail.value,
      },
      '7d',
    );
  });
});
