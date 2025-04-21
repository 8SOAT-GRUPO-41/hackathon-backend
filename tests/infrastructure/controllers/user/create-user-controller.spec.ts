import { CreateUser } from '@/application/usecases/user/create-user';
import { User } from '@/domain/entities/user';
import { UserEmail } from '@/domain/value-objects/user-email';
import { UserPassword } from '@/domain/value-objects/user-password';
import { CreateUserController } from '@/infrastructure/controllers/user/create-user-controller';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { HttpRequest } from '@/infrastructure/http/interfaces';

type CreateUserRequestBody = {
  email: string;
  password: string;
};

describe('CreateUserController', () => {
  let createUserController: CreateUserController;
  let createUserMock: jest.Mocked<CreateUser>;

  beforeEach(() => {
    createUserMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateUser>;

    createUserController = new CreateUserController(createUserMock);
  });

  it('should call CreateUser with correct values', async () => {
    const httpRequest: HttpRequest<CreateUserRequestBody> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    createUserMock.execute.mockResolvedValue(undefined);

    await createUserController.handle(httpRequest);

    expect(createUserMock.execute).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password',
    });
  });

  it('should return 201 on success', async () => {
    const httpRequest: HttpRequest<CreateUserRequestBody> = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
      },
      query: {},
      params: {},
      headers: {},
    };

    createUserMock.execute.mockResolvedValue(undefined);

    const httpResponse = await createUserController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(HttpStatusCode.CREATED);
    expect(httpResponse.body).toBeUndefined();
  });
});
