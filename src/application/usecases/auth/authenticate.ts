import { InvalidPasswordError, NotFoundError } from '@/domain/errors';
import { IUserRepository } from '@/domain/repository/user-repository';
import { ITokenService } from '@/domain/services/token-service';

type AuthenticateInput = {
  email: string;
  password: string;
};

type AuthenticateOutput = {
  token: string;
  refreshToken: string;
  userId: string;
};

export class Authenticate {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: AuthenticateInput): Promise<AuthenticateOutput> {
    const { email, password } = input;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const isValidPassword = await user.password.compare(password);
    if (!isValidPassword) {
      throw new InvalidPasswordError('Senha inválida');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email.value,
    };

    const token = this.tokenService.generateToken(tokenPayload, '15m');
    const refreshToken = this.tokenService.generateRefreshToken(tokenPayload, '7d');

    return {
      token,
      refreshToken,
      userId: user.id,
    };
  }
}
