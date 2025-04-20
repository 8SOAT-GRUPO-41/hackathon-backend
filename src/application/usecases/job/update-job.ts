import { JobStatus } from '@/domain/enums/job-status';
import { IProcessingJobRepository } from '@/domain/repository/job-repository';

type Input = {
  jobId: string;
  status: JobStatus;
};

// TODO: add job status history
export class UpdateProcessingJob {
  constructor(private readonly processingJobRepository: IProcessingJobRepository) {}

  async execute(input: Input) {
    const { jobId, status } = input;
    const job = await this.processingJobRepository.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    job.updateStatus(status);
    await this.processingJobRepository.save(job);
    return job;
  }
}
