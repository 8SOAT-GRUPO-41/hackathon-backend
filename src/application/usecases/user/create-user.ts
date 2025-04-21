import { User } from '@/domain/entities/user';
import { ConflictError } from '@/domain/errors/conflict-error';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

type Input = {
  email: string;
  password: string;
};

export class CreateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input) {
    const { email, password } = input;
    const userExists = await this.userRepository.findByEmail(email);
    if (userExists) {
      throw new ConflictError('User already exists');
    }
    const hashedPassword = await UserPassword.create(password);
    const user = User.create(new UserEmail(email), hashedPassword);
    await this.userRepository.save(user);
  }
}
