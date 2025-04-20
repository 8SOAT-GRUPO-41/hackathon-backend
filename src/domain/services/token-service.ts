export interface ITokenService {
  generateToken(payload: Record<string, any>, expiresIn?: string): string;
  verifyToken(token: string): Record<string, any>;
  generateRefreshToken(payload: Record<string, any>, expiresIn?: string): string;
  verifyRefreshToken(token: string): Record<string, any>;
}
