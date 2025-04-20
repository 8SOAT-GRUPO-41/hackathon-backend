import { IQueueService } from '@/application/ports/queue';
import { Notification } from '@/domain/entities/notification';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { Video } from '@/domain/entities/video';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';
import { NotFoundError } from '@/domain/errors';
import { IUserRepository } from '@/domain/repository/user-repository';
import { IVideoRepository } from '@/domain/repository/video-repository';

type Input = { videoId: string; jobStatus: JobStatus };
type Output = { video: Video; statusUpdated: boolean; currentStatus?: JobStatus };

export class TrackProcessingJob {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly queueService: IQueueService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ videoId, jobStatus }: Input): Promise<Output> {
    const video = await this.findVideoOrThrow(videoId);
    const { job, statusUpdated } = this.applyStatus(video, jobStatus);

    const notification = await this.buildNotification(video, jobStatus);
    await this.videoRepository.save(video);

    if (notification) {
      await this.queueService.sendNotification(notification);
    }

    return {
      video,
      statusUpdated,
      currentStatus: job.currentStatus,
    };
  }

  private async findVideoOrThrow(id: string): Promise<Video> {
    const video = await this.videoRepository.findById(id);
    if (!video) throw new NotFoundError(`Video ${id} not found`);
    return video;
  }

  private applyStatus(video: Video, newStatus: JobStatus) {
    let job = video.processingJob;
    let statusUpdated = false;

    if (!job) {
      job = ProcessingJob.create(video.id);
      video.addProcessingJob(job);
      statusUpdated = true;
    } else {
      const previous = job.currentStatus;
      job.updateStatus(newStatus);
      statusUpdated = previous !== newStatus;
    }

    return { job, statusUpdated };
  }

  private async buildNotification(
    video: Video,
    status: JobStatus,
  ): Promise<Notification | undefined> {
    if (![JobStatus.COMPLETED, JobStatus.FAILED].includes(status)) {
      return undefined;
    }

    const notification = Notification.create({
      userId: video.userId,
      channel: Channel.EMAIL,
      payload: {
        status,
        videoId: video.id,
        videoName: video.name,
        notificationChannel: Channel.EMAIL,
      },
    });

    const user = await this.userRepository.findById(video.userId);
    if (user) notification.userEmail = user.email.value;

    video.processingJob!.addNotification(notification);
    return notification;
  }
}
