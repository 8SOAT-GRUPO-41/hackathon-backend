import { NotFoundError } from '@/domain/errors/not-found-error';
import { IUserRepository } from '@/domain/repository/user-repository';

type Input = {
  userId: string;
};

export class GetUserById {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input) {
    const { userId } = input;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
