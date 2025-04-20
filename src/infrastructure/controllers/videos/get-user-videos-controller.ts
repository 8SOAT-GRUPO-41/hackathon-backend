import { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';
import { Controller } from '../interfaces';
import { GetUserVideos } from '@/application/usecases/video/get-user-videos';

export class GetUserVideosController implements Controller {
  constructor(private readonly getUserVideosUseCase: GetUserVideos) {}

  async handle(input: HttpRequest): Promise<HttpResponse> {
    const { userId } = input;
    const result = await this.getUserVideosUseCase.execute({
      userId: userId!,
    });
    return {
      statusCode: 200,
      body: result.map((video) => video.toJSON()),
    };
  }
}
