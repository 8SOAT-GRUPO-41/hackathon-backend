import { ProcessingJob } from '@/domain/entities/processing-job';
import { Video } from '@/domain/entities/video';
import { JobStatus } from '@/domain/enums/job-status';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = {
  videoId: string;
  jobStatus: JobStatus;
};

export class TrackProcessingJob {
  constructor(private readonly videoRepository: IVideoRepository) {}

  async execute(input: Input): Promise<Video> {
    const video = await this.videoRepository.findById(input.videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    const job = video.processingJob;
    if (!job) {
      video.addProcessingJob(ProcessingJob.create(input.videoId));
    } else {
      job.updateStatus(input.jobStatus);
    }
    await this.videoRepository.save(video);
    return video;
  }
}
