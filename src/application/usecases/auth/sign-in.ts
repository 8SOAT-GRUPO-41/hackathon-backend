import { InvalidPasswordError, NotFoundError } from '@/domain/errors'
import { IUserRepository } from '@/domain/repository/user-repository'

type Input = {
  email: string
  password: string
}

export class SignIn {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input) {
    const { email, password } = input
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    const isValidPassword = await user.password.compare(password)
    if (!isValidPassword) {
    throw new InvalidPasswordError('Invalid password')
    }
    return user // TODO: return a token or session
  }
}
