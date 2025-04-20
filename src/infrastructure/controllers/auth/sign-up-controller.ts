import { SignUp } from '@/application/usecases/auth/sign-up';
import { Controller } from '../interfaces';
import { HttpRequest, HttpResponse } from '../../http/interfaces';
import { HttpStatusCode } from '../../http/helper';

type SignUpRequestBody = {
  email: string;
  password: string;
};

export class SignUpController implements Controller {
  constructor(private readonly signUp: SignUp) {}

  async handle(
    input: HttpRequest<SignUpRequestBody, unknown, unknown>,
  ): Promise<HttpResponse<unknown>> {
    const { body } = input;
    const user = await this.signUp.execute({
      email: body.email,
      password: body.password,
    });
    return {
      statusCode: HttpStatusCode.CREATED,
      body: {
        id: user.id,
        email: user.email.value,
      },
    };
  }
}
