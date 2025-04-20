import { ProcessingJob } from '@/domain/entities/processing-job';
import { IProcessingJobRepository } from '@/domain/repository/job-repository';

type Input = {
  videoId: string;
};

export class CreateProcessingJob {
  constructor(private readonly processingJobRepository: IProcessingJobRepository) {}

  async execute(input: Input) {
    const { videoId } = input;
    const job = ProcessingJob.create(videoId);
    await this.processingJobRepository.save(job);
    return job;
  }
}
