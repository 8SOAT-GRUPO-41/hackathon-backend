import { GetZipVideo } from '@/application/usecases/video/get-zip-video';
import { GetZipVideoDownloadUrlController } from '@/infrastructure/controllers/videos/get-zip-video-controller';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('GetZipVideoDownloadUrlController', () => {
  let getZipVideoController: GetZipVideoDownloadUrlController;
  let getZipVideoMock: jest.Mocked<GetZipVideo>;

  beforeEach(() => {
    getZipVideoMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetZipVideo>;

    getZipVideoController = new GetZipVideoDownloadUrlController(getZipVideoMock);
  });

  it('should call GetZipVideo with correct videoId', async () => {
    const httpRequest: HttpRequest<unknown, unknown, { videoId: string }> = {
      params: { videoId: 'video-id' },
      body: {},
      query: {},
      headers: {},
    };

    getZipVideoMock.execute.mockResolvedValue({
      downloadUrl: 'https://download-url.com',
    });

    await getZipVideoController.handle(httpRequest);

    expect(getZipVideoMock.execute).toHaveBeenCalledWith({
      videoId: 'video-id',
    });
  });

  it('should return 200 with download URL on success', async () => {
    const httpRequest: HttpRequest<unknown, unknown, { videoId: string }> = {
      params: { videoId: 'video-id' },
      body: {},
      query: {},
      headers: {},
    };

    const result = { downloadUrl: 'https://download-url.com' };

    getZipVideoMock.execute.mockResolvedValue(result);

    const httpResponse = await getZipVideoController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toBe(result);
  });
});
