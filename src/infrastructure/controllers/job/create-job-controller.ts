import { CreateProcessingJob } from '@/application/usecases/job/create-job';
import { Controller } from '../interfaces';
import { HttpRequest, HttpResponse } from '../../http/interfaces';
import { HttpStatusCode } from '../../http/helper';

type CreateProcessingJobRequestBody = {
  videoId: string;
};

export class CreateProcessingJobController implements Controller {
  constructor(private readonly createProcessingJob: CreateProcessingJob) {}

  async handle(
    input: HttpRequest<CreateProcessingJobRequestBody, unknown, unknown>,
  ): Promise<HttpResponse<unknown>> {
    const { body } = input;
    const job = await this.createProcessingJob.execute({
      videoId: body.videoId,
    });
    return {
      statusCode: HttpStatusCode.CREATED,
      body: job,
    };
  }
}
