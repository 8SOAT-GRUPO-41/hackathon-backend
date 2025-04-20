import { SignIn } from '@/application/usecases/auth/sign-in';
import { Controller } from '../interfaces';
import { HttpRequest, HttpResponse } from '../../http/interfaces';
import { HttpStatusCode } from '../../http/helper';

type SignInRequestBody = {
  email: string;
  password: string;
};

export class SignInController implements Controller {
  constructor(private readonly signIn: SignIn) {}

  async handle(
    input: HttpRequest<SignInRequestBody, unknown, unknown>,
  ): Promise<HttpResponse<unknown>> {
    const { body } = input;
    const user = await this.signIn.execute({
      email: body.email,
      password: body.password,
    });
    return {
      statusCode: HttpStatusCode.OK,
      body: user,
    };
  }
}
