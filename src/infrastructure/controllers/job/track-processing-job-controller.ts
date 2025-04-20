import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { JobStatus } from '@/domain/enums/job-status';
import { Message } from '@/infrastructure/consumers/types';
import { Controller } from '@/infrastructure/controllers/interfaces';

type Input = {
  videoId: string;
  status: JobStatus;
};

type Output = {
  success: boolean;
};

export class TrackProcessingJobController implements Controller<Message<Input>, Output> {
  constructor(private readonly trackProcessingJob: TrackProcessingJob) {}

  async handle(request: Message<Input>): Promise<Output> {
    const { body } = request;
    await this.trackProcessingJob.execute({
      jobStatus: body.status,
      videoId: body.videoId,
    });
    return { success: true };
  }
}
