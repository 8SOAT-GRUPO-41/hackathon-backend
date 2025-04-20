import { ITokenService } from '@/domain/services/token-service';
import jwt from 'jsonwebtoken';

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secretKey: string,
    private readonly refreshSecretKey: string,
  ) {}

  generateToken(payload: Record<string, any>, expiresIn: string = '15m'): string {
    return jwt.sign(payload, this.secretKey, { expiresIn } as jwt.SignOptions);
  }

  verifyToken(token: string): Record<string, any> {
    try {
      return jwt.verify(token, this.secretKey) as Record<string, any>;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  generateRefreshToken(payload: Record<string, any>, expiresIn: string = '7d'): string {
    return jwt.sign(payload, this.refreshSecretKey, {
      expiresIn,
    } as jwt.SignOptions);
  }

  verifyRefreshToken(token: string): Record<string, any> {
    try {
      return jwt.verify(token, this.refreshSecretKey) as Record<string, any>;
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }
}
