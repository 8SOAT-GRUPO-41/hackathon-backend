import { Controller } from '../interfaces';
import { HttpRequest, HttpResponse } from '../../http/interfaces';
import { HttpStatusCode } from '../../http/helper';
import { UpdateProcessingJob } from '@/application/usecases/job/update-job';
import { JobStatus } from '@/domain/enums/job-status';

type UpdateProcessingJobRequestBody = {
  jobId: string;
  status: JobStatus;
};

export class UpdateProcessingJobController implements Controller {
  constructor(private readonly updateProcessingJob: UpdateProcessingJob) {}

  async handle(
    input: HttpRequest<UpdateProcessingJobRequestBody, unknown, unknown>,
  ): Promise<HttpResponse<unknown>> {
    const { body } = input;
    const job = await this.updateProcessingJob.execute({
      jobId: body.jobId,
      status: body.status,
    });
    return {
      statusCode: HttpStatusCode.OK,
      body: job,
    };
  }
}
