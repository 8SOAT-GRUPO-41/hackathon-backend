import { ProcessingJob } from '@/domain/entities/processing-job';
import { Video } from '@/domain/entities/video';
import { JobStatus } from '@/domain/enums/job-status';
import { NotFoundError } from '@/domain/errors';
import { IVideoRepository } from '@/domain/repository/video-repository';
import { IQueueService } from '@/application/ports/queue';
type Input = {
  videoId: string;
  jobStatus: JobStatus;
};

type Output = {
  video: Video;
  statusUpdated: boolean;
  currentStatus: JobStatus | undefined;
};

export class TrackProcessingJob {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly queueService: IQueueService,
  ) {}
  async execute(input: Input): Promise<Output> {
    const video = await this.videoRepository.findById(input.videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    let job = video.processingJob;
    let statusUpdated = false;
    if (!job) {
      job = ProcessingJob.create(input.videoId);
      video.addProcessingJob(job);
      statusUpdated = true;
    } else {
      const previousStatus = job.currentStatus;
      job.updateStatus(input.jobStatus);
      statusUpdated = previousStatus !== job.currentStatus;
    }
    await this.videoRepository.save(video);
    if (input.jobStatus === JobStatus.COMPLETED) {
      await this.queueService.sendMessage(video.id, video.name, input.jobStatus);
    }
    if (input.jobStatus === JobStatus.FAILED) {
      await this.queueService.sendMessage(
        video.id,
        video.name,
        input.jobStatus,
        job?.errorMessage ?? 'Internal Server Error',
      );
    }
    return {
      video,
      statusUpdated,
      currentStatus: job.currentStatus,
    };
  }
}
