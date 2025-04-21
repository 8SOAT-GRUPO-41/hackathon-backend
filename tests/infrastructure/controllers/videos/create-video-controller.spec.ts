import { CreateVideo } from '@/application/usecases/video/create-video';
import { Video } from '@/domain/entities/video';
import { CreateVideoController } from '@/infrastructure/controllers/videos/create-video-controller';
import { HttpRequest } from '@/infrastructure/http/interfaces';

type CreateUserRequestBody = {
  name: string;
  description: string;
  tags: string[];
};

describe('CreateVideoController', () => {
  let createVideoController: CreateVideoController;
  let createVideoMock: jest.Mocked<CreateVideo>;

  beforeEach(() => {
    createVideoMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateVideo>;

    createVideoController = new CreateVideoController(createVideoMock);
  });

  it('should call CreateVideo with correct values', async () => {
    const httpRequest: HttpRequest<CreateUserRequestBody> = {
      body: {
        name: 'Test Video',
        description: 'Test Description',
        tags: ['test', 'video'],
      },
      userId: 'user-id',
      query: {},
      params: {},
      headers: {},
    };

    const mockVideo = new Video(
      'video-id',
      'user-id',
      'Test Video',
      'Test Description',
      'video-key',
      'result-key',
    );
    const mockResult = {
      video: mockVideo,
      uploadUrl: 'https://presigned-url.com',
    };

    createVideoMock.execute.mockResolvedValue(mockResult);

    await createVideoController.handle(httpRequest);

    expect(createVideoMock.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      name: 'Test Video',
      description: 'Test Description',
    });
  });

  it('should return 201 with video data on success', async () => {
    const httpRequest: HttpRequest<CreateUserRequestBody> = {
      body: {
        name: 'Test Video',
        description: 'Test Description',
        tags: ['test', 'video'],
      },
      userId: 'user-id',
      query: {},
      params: {},
      headers: {},
    };

    const mockVideo = new Video(
      'video-id',
      'user-id',
      'Test Video',
      'Test Description',
      'video-key',
      'result-key',
    );
    const mockResult = {
      video: mockVideo,
      uploadUrl: 'https://presigned-url.com',
    };

    createVideoMock.execute.mockResolvedValue(mockResult);

    const httpResponse = await createVideoController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      videoId: 'video-id',
      uploadPresignedUrl: 'https://presigned-url.com',
    });
  });
});
