import { ITokenService } from "@/domain/services/token-service";
import jwt from "jsonwebtoken";

export class JwtTokenService implements ITokenService {
  constructor(private readonly secretKey: string) {}

  generateToken(
    payload: Record<string, any>,
    expiresIn: string = "1d"
  ): string {
    return jwt.sign(payload, this.secretKey, { expiresIn } as jwt.SignOptions);
  }

  verifyToken(token: string): Record<string, any> {
    try {
      return jwt.verify(token, this.secretKey) as Record<string, any>;
    } catch (error) {
      throw new Error("Token inválido ou expirado");
    }
  }
}
