import { DeleteUser } from '@/application/usecases/user/delete-user';
import { DeleteUserController } from '@/infrastructure/controllers/user/delete-user-controller';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('DeleteUserController', () => {
  let deleteUserController: DeleteUserController;
  let deleteUserMock: jest.Mocked<DeleteUser>;

  beforeEach(() => {
    deleteUserMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteUser>;

    deleteUserController = new DeleteUserController(deleteUserMock);
  });

  it('should call DeleteUser with correct userId', async () => {
    const httpRequest: HttpRequest<unknown, unknown, { id: string }> = {
      body: {},
      query: {},
      params: {
        id: 'any_user_id',
      },
      headers: {},
    };

    deleteUserMock.execute.mockResolvedValue(undefined);

    await deleteUserController.handle(httpRequest);

    expect(deleteUserMock.execute).toHaveBeenCalledWith({
      userId: 'any_user_id',
    });
  });

  it('should return 204 on success', async () => {
    const httpRequest: HttpRequest<unknown, unknown, { id: string }> = {
      body: {},
      query: {},
      params: {
        id: 'any_user_id',
      },
      headers: {},
    };

    deleteUserMock.execute.mockResolvedValue(undefined);

    const httpResponse = await deleteUserController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(HttpStatusCode.NO_CONTENT);
    expect(httpResponse.body).toBeUndefined();
  });
});
