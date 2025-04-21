import { GetUserVideos } from '@/application/usecases/video/get-user-videos';
import { Video } from '@/domain/entities/video';
import { GetUserVideosController } from '@/infrastructure/controllers/videos/get-user-videos-controller';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('GetUserVideosController', () => {
  let getUserVideosController: GetUserVideosController;
  let getUserVideosMock: jest.Mocked<GetUserVideos>;

  beforeEach(() => {
    getUserVideosMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUserVideos>;

    getUserVideosController = new GetUserVideosController(getUserVideosMock);
  });

  it('should call GetUserVideos with correct userId', async () => {
    const httpRequest: HttpRequest = {
      userId: 'user-id',
      body: {},
      query: {},
      params: {},
      headers: {},
    };

    getUserVideosMock.execute.mockResolvedValue([]);

    await getUserVideosController.handle(httpRequest);

    expect(getUserVideosMock.execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });
  });

  it('should return 200 with videos data on success', async () => {
    const httpRequest: HttpRequest = {
      userId: 'user-id',
      body: {},
      query: {},
      params: {},
      headers: {},
    };

    const mockVideo1 = new Video(
      'video-id-1',
      'user-id',
      'Test Video 1',
      'Description 1',
      'video-key-1',
      'result-key-1',
    );
    const mockVideo2 = new Video(
      'video-id-2',
      'user-id',
      'Test Video 2',
      'Description 2',
      'video-key-2',
      'result-key-2',
    );

    getUserVideosMock.execute.mockResolvedValue([mockVideo1, mockVideo2]);

    const httpResponse = await getUserVideosController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual([mockVideo1.toJSON(), mockVideo2.toJSON()]);
  });
});
