import { SignIn } from '@/application/usecases/auth/sign-in';
import { User } from '@/domain/entities/user';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';
import { SignInController } from '@/infrastructure/controllers/auth/sign-in-controller';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('SignInController', () => {
  let signInController: SignInController;
  let signInMock: jest.Mocked<SignIn>;

  beforeEach(() => {
    signInMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SignIn>;

    signInController = new SignInController(signInMock);
  });

  it('should call SignIn with correct values', async () => {
    const httpRequest: HttpRequest<{ email: string; password: string }> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    await signInController.handle(httpRequest);

    expect(signInMock.execute).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password',
    });
  });

  it('should return 200 with user data on success', async () => {
    const httpRequest: HttpRequest<{ email: string; password: string }> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    const mockEmail = new UserEmail('any_email@mail.com');
    const mockPassword = UserPassword.fromHash('hashed_password');
    const mockUser = new User('any_id', mockEmail, mockPassword);

    signInMock.execute.mockResolvedValue(mockUser);

    const httpResponse = await signInController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(HttpStatusCode.OK);
    expect(httpResponse.body).toBe(mockUser);
  });
});
