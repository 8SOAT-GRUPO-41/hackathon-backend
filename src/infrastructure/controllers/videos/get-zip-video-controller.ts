import { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';
import { Controller } from '../interfaces';
import { GetZipVideo } from '@/application/usecases/video/get-zip-video';

export class GetZipVideoDownloadUrlController implements Controller {
  constructor(private readonly getZipVideoDownloadUrlUseCase: GetZipVideo) {}

  async handle(input: HttpRequest<unknown, unknown, { videoId: string }>): Promise<HttpResponse> {
    const { videoId } = input.params;
    const result = await this.getZipVideoDownloadUrlUseCase.execute({
      videoId: videoId,
    });
    return {
      statusCode: 200,
      body: result,
    };
  }
}
