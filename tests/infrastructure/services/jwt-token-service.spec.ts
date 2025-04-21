import { JwtTokenService } from '@/infrastructure/services/jwt-token-service';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JwtTokenService', () => {
  let jwtTokenService: JwtTokenService;
  const secretKey = 'test-secret-key';
  const refreshSecretKey = 'test-refresh-secret-key';
  const payload = { userId: '123', email: 'test@example.com' };

  beforeEach(() => {
    jwtTokenService = new JwtTokenService(secretKey, refreshSecretKey);
    jest.resetAllMocks();
  });

  describe('generateToken', () => {
    it('should call jwt.sign with the correct parameters', () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

      const token = jwtTokenService.generateToken(payload);

      expect(token).toBe('mocked-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, secretKey, { expiresIn: '15m' });
    });

    it('should use custom expiresIn when provided', () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

      const token = jwtTokenService.generateToken(payload, '1h');

      expect(token).toBe('mocked-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, secretKey, { expiresIn: '1h' });
    });
  });

  describe('verifyToken', () => {
    it('should call jwt.verify with the correct parameters', () => {
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = jwtTokenService.verifyToken('token');

      expect(result).toEqual(payload);
      expect(jwt.verify).toHaveBeenCalledWith('token', secretKey);
    });

    it('should throw an error when verification fails', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => jwtTokenService.verifyToken('invalid-token')).toThrow(
        'Token inválido ou expirado',
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should call jwt.sign with the correct parameters', () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked-refresh-token');

      const refreshToken = jwtTokenService.generateRefreshToken(payload);

      expect(refreshToken).toBe('mocked-refresh-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, refreshSecretKey, { expiresIn: '7d' });
    });

    it('should use custom expiresIn when provided', () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked-refresh-token');

      const refreshToken = jwtTokenService.generateRefreshToken(payload, '30d');

      expect(refreshToken).toBe('mocked-refresh-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, refreshSecretKey, { expiresIn: '30d' });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should call jwt.verify with the correct parameters', () => {
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = jwtTokenService.verifyRefreshToken('refresh-token');

      expect(result).toEqual(payload);
      expect(jwt.verify).toHaveBeenCalledWith('refresh-token', refreshSecretKey);
    });

    it('should throw an error when verification fails', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      expect(() => jwtTokenService.verifyRefreshToken('invalid-refresh-token')).toThrow(
        'Refresh token inválido ou expirado',
      );
    });
  });
});
