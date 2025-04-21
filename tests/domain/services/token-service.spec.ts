import { ITokenService } from '@/domain/services/token-service';

class MockTokenService implements ITokenService {
  generateToken(payload: Record<string, any>, expiresIn?: string): string {
    return `mocked-token-${JSON.stringify(payload)}-${expiresIn || 'default'}`;
  }

  verifyToken(token: string): Record<string, any> {
    const [, payloadStr] = token.split('mocked-token-');
    const [payload] = payloadStr.split('-default');
    return JSON.parse(payload);
  }

  generateRefreshToken(payload: Record<string, any>, expiresIn?: string): string {
    return `mocked-refresh-token-${JSON.stringify(payload)}-${expiresIn || 'default'}`;
  }

  verifyRefreshToken(token: string): Record<string, any> {
    const [, payloadStr] = token.split('mocked-refresh-token-');
    const [payload] = payloadStr.split('-default');
    return JSON.parse(payload);
  }
}

describe('TokenService Interface', () => {
  let tokenService: ITokenService;

  beforeEach(() => {
    tokenService = new MockTokenService();
  });

  describe('generateToken', () => {
    it('should generate a token with the given payload', () => {
      const payload = { userId: '123', role: 'admin' };

      const token = tokenService.generateToken(payload);

      expect(token).toContain(JSON.stringify(payload));
    });

    it('should include expiresIn when provided', () => {
      const payload = { userId: '123' };
      const expiresIn = '1h';

      const token = tokenService.generateToken(payload, expiresIn);

      expect(token).toContain(expiresIn);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return the payload from a token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = tokenService.generateToken(payload);

      const verified = tokenService.verifyToken(token);

      expect(verified).toEqual(payload);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token with the given payload', () => {
      const payload = { userId: '123', sessionId: 'abc' };

      const refreshToken = tokenService.generateRefreshToken(payload);

      expect(refreshToken).toContain(JSON.stringify(payload));
      expect(refreshToken).toContain('refresh-token');
    });

    it('should include expiresIn when provided', () => {
      const payload = { userId: '123' };
      const expiresIn = '7d';

      const refreshToken = tokenService.generateRefreshToken(payload, expiresIn);

      expect(refreshToken).toContain(expiresIn);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and return the payload from a refresh token', () => {
      const payload = { userId: '123', sessionId: 'abc' };
      const refreshToken = tokenService.generateRefreshToken(payload);

      const verified = tokenService.verifyRefreshToken(refreshToken);

      expect(verified).toEqual(payload);
    });
  });
});
