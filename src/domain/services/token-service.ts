export interface ITokenService {
  generateToken(payload: Record<string, any>, expiresIn?: string): string;
  verifyToken(token: string): Record<string, any>;
}
