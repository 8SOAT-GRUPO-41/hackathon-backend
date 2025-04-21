import { SignUp } from '@/application/usecases/auth/sign-up';
import { User } from '@/domain/entities/user';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';
import { SignUpController } from '@/infrastructure/controllers/auth/sign-up-controller';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { HttpRequest } from '@/infrastructure/http/interfaces';

type SignUpRequestBody = {
  email: string;
  password: string;
};

describe('SignUpController', () => {
  let signUpController: SignUpController;
  let signUpMock: jest.Mocked<SignUp>;

  beforeEach(() => {
    signUpMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SignUp>;

    signUpController = new SignUpController(signUpMock);
  });

  it('should call SignUp with correct values', async () => {
    const httpRequest: HttpRequest<SignUpRequestBody> = {
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

    signUpMock.execute.mockResolvedValue(mockUser);

    await signUpController.handle(httpRequest);

    expect(signUpMock.execute).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password',
    });
  });

  it('should return 201 with user data on success', async () => {
    const httpRequest: HttpRequest<SignUpRequestBody> = {
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

    signUpMock.execute.mockResolvedValue(mockUser);

    const httpResponse = await signUpController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(HttpStatusCode.CREATED);
    expect(httpResponse.body).toEqual({
      id: mockUser.id,
      email: mockUser.email.value,
    });
  });
});
