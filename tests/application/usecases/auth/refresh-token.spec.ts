import { RefreshToken } from '@/application/usecases/auth/refresh-token';
import { ITokenService } from '@/domain/services/token-service';

describe('RefreshToken UseCase', () => {
  let tokenService: jest.Mocked<ITokenService>;
  let refreshToken: RefreshToken;

  beforeEach(() => {
    jest.clearAllMocks();

    tokenService = {
      generateToken: jest.fn().mockReturnValue('new-token'),
      generateRefreshToken: jest.fn().mockReturnValue('new-refresh-token'),
      verifyToken: jest.fn(),
      verifyRefreshToken: jest.fn().mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
      }),
    };

    refreshToken = new RefreshToken(tokenService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should refresh tokens successfully', async () => {
    // Arrange
    const input = {
      refreshToken: 'valid-refresh-token',
    };

    // Act
    const result = await refreshToken.execute(input);

    // Assert
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(input.refreshToken);
    expect(tokenService.generateToken).toHaveBeenCalledWith(
      {
        userId: 'user-123',
        email: 'test@example.com',
      },
      '15m',
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      {
        userId: 'user-123',
        email: 'test@example.com',
      },
      '7d',
    );
    expect(result).toEqual({
      token: 'new-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('should throw error if refresh token is invalid', async () => {
    // Arrange
    const input = {
      refreshToken: 'invalid-refresh-token',
    };

    const mockError = new Error('Invalid token');
    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(refreshToken.execute(input)).rejects.toThrow('Refresh token inválido ou expirado');
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(input.refreshToken);
    expect(tokenService.generateToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should throw error if refresh token is expired', async () => {
    // Arrange
    const input = {
      refreshToken: 'expired-refresh-token',
    };

    const mockError = new Error('jwt expired');
    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(refreshToken.execute(input)).rejects.toThrow('Refresh token inválido ou expirado');
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(input.refreshToken);
    expect(tokenService.generateToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should propagate errors from tokenService.generateToken', async () => {
    // Arrange
    const input = {
      refreshToken: 'valid-refresh-token',
    };

    const mockError = new Error('Token generation error');
    tokenService.generateToken.mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(refreshToken.execute(input)).rejects.toThrow('Refresh token inválido ou expirado');
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(input.refreshToken);
    expect(tokenService.generateToken).toHaveBeenCalledWith(
      {
        userId: 'user-123',
        email: 'test@example.com',
      },
      '15m',
    );
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it('should propagate errors from tokenService.generateRefreshToken', async () => {
    // Arrange
    const input = {
      refreshToken: 'valid-refresh-token',
    };

    const mockError = new Error('Refresh token generation error');
    tokenService.generateRefreshToken.mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(refreshToken.execute(input)).rejects.toThrow('Refresh token inválido ou expirado');
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(input.refreshToken);
    expect(tokenService.generateToken).toHaveBeenCalledWith(
      {
        userId: 'user-123',
        email: 'test@example.com',
      },
      '15m',
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(
      {
        userId: 'user-123',
        email: 'test@example.com',
      },
      '7d',
    );
  });
});
