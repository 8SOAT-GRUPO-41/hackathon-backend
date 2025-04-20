import { NotFoundError } from '@/domain/errors/not-found-error';
import { IUserRepository } from '@/domain/repository/user-repository';

type Input = {
  email: string;
};

export class GetUserByEmail {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input) {
    const { email } = input;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
