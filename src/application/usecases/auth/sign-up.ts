import { ConflictError } from '@/domain/errors';
import { User } from '@/domain/entities/user';
import { IUserRepository } from '@/domain/repository/user-repository';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';

type Input = {
  email: string;
  password: string;
};

export class SignUp {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input) {
    const { email, password } = input;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }
    const hashedPassword = await UserPassword.create(password);
    const user = User.create(new UserEmail(email), hashedPassword);
    await this.userRepository.save(user);
    return user;
  }
}
