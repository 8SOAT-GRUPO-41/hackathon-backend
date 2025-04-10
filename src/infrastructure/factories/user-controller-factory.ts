import { CreateUser } from '@/application/usecases/user/create-user'
import { CreateUserController } from '../controllers/user/create-user-controller'
import { UserRepository } from '../repository/user-repository'
import { DeleteUserController } from '../controllers/user/delete-user-controller'
import { DeleteUser } from '@/application/usecases/user/delete-user'
import { SignIn } from '@/application/usecases/auth/sign-in'
import { SignInController } from '../controllers/auth/sign-in-controller'

export const makeUserRepository = () => {
  return new UserRepository()
}

export const makeCreateUserUseCase = () => {
  return new CreateUser(makeUserRepository())
}

export const makeDeleteUserUseCase = () => {
  return new DeleteUser(makeUserRepository())
}

export const makeCreateUserController = () => {
  return new CreateUserController(makeCreateUserUseCase())
}

export const makeDeleteUserController = () => {
  return new DeleteUserController(makeDeleteUserUseCase())
}

export const makeSignIn = () => {
  return new SignIn(makeUserRepository())
}

export const makeSignInController = () => {
  return new SignInController(makeSignIn())
}
