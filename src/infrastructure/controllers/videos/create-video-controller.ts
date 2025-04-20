import { HttpRequest, HttpResponse } from '@/infrastructure/http/interfaces';
import { Controller } from '../interfaces';
import { CreateVideo } from '@/application/usecases/video/create-video';

type CreateUserRequestBody = {
  name: string;
  description: string;
  tags: string[];
};

export class CreateVideoController implements Controller {
  constructor(private readonly createVideoUseCase: CreateVideo) {}

  async handle(
    input: HttpRequest<CreateUserRequestBody, unknown, unknown>,
  ): Promise<HttpResponse<unknown>> {
    const { body, userId } = input;
    const result = await this.createVideoUseCase.execute({
      userId: userId!,
      description: body.description,
      name: body.name,
    });
    return {
      statusCode: 201,
      body: {
        videoId: result.video.id,
        uploadPresignedUrl: result.uploadUrl,
      },
    };
  }
}
