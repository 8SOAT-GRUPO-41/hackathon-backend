import { CreateUser } from '@/application/usecases/user/create-user';
import { Controller } from '../interfaces';
import { HttpRequest, HttpResponse } from '../../http/interfaces';
import { HttpStatusCode } from '../../http/helper';

type CreateUserRequestBody = {
  email: string;
  password: string;
};

export class CreateUserController implements Controller {
  constructor(private readonly createUser: CreateUser) {}

  async handle(
    input: HttpRequest<CreateUserRequestBody, unknown, unknown>,
  ): Promise<HttpResponse<unknown>> {
    const { body } = input;
    const user = await this.createUser.execute({
      email: body.email,
      password: body.password,
    });
    return {
      statusCode: HttpStatusCode.CREATED,
      body: user,
    };
  }
}
