import { ITokenService } from '@/domain/services/token-service';

type RefreshTokenInput = {
  refreshToken: string;
};

type RefreshTokenOutput = {
  token: string;
  refreshToken: string;
};

export class RefreshToken {
  constructor(private readonly tokenService: ITokenService) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const { refreshToken } = input;

    try {
      // Verificar se o refresh token é válido
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      // Gerar novos tokens
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
      };

      const newToken = this.tokenService.generateToken(tokenPayload, '15m');
      const newRefreshToken = this.tokenService.generateRefreshToken(tokenPayload, '7d');

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }
}
