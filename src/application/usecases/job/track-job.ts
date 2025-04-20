import { ProcessingJob } from '@/domain/entities/processing-job';
import { JobStatus } from '@/domain/enums/job-status';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = {
  videoId: string;
  jobStatus: JobStatus;
};

export class TrackProcessingJob {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(input: Input): Promise<void> {
    const video = await this.videoRepository.findById(input.videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    const processingJobs = video.processingJobs;
    if (processingJobs.length === 0) {
      video.addProcessingJob(ProcessingJob.create(input.videoId));
    }
    const job = processingJobs[processingJobs.length - 1];
    job.updateStatus(input.jobStatus);
    await this.videoRepository.saveProcessingJob(job);
  }
}
