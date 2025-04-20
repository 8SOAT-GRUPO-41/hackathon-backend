import { JobStatusHistory } from '@/domain/entities/job-status-history';
import { Notification } from '@/domain/entities/notification';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { Video } from '@/domain/entities/video';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '@/domain/enums/job-status';
import { IVideoRepository } from '@/domain/repository/video-repository';
import {
  JobStatusHistory as JobStatusHistoryPrisma,
  Notification as NotificationPrisma,
  ProcessingJob as ProcessingJobPrisma,
  Video as VideoPrisma,
} from '@prisma/client';
import prisma from '../prisma';

type ProcessingJobWithStatusHistoryAndNotification = ProcessingJobPrisma & {
  statusHistory: JobStatusHistoryPrisma[];
  Notification: NotificationPrisma[];
};

export class VideoRepository implements IVideoRepository {
  async findById(id: string): Promise<Video | null> {
    const video = await prisma.video.findUnique({
      where: {
        id,
      },
      include: {
        processingJobs: {
          include: {
            statusHistory: true,
            Notification: true,
          },
        },
      },
    });
    if (!video) {
      return null;
    }
    return this.mapToDomain(video);
  }
  async findByUserId(userId: string): Promise<Video[]> {
    const videos = await prisma.video.findMany({
      where: {
        userId,
      },
      include: {
        processingJobs: {
          include: {
            statusHistory: true,
            Notification: true,
          },
        },
      },
    });
    return videos.map((video) => this.mapToDomain(video));
  }
  async save(video: Video): Promise<void> {
    await prisma.video.create({
      data: {
        id: video.id,
        userId: video.userId,
        originalKey: video.originalKey,
        name: video.name,
        description: video.description,
      },
    });
  }

  async saveProcessingJob(processingJob: ProcessingJob): Promise<void> {
    await prisma.processingJob.create({
      data: {
        id: processingJob.id,
        videoId: processingJob.videoId,
        requestedAt: processingJob.requestedAt,
        errorMessage: processingJob.errorMessage,
        startedAt: processingJob.startedAt,
        finishedAt: processingJob.finishedAt,
        statusHistory: {
          create: processingJob.statusHistory.map((statusHistory) => ({
            id: statusHistory.id,
            status: statusHistory.status as JobStatus,
            changedAt: statusHistory.changedAt,
          })),
        },
      },
    });
  }

  private mapToDomain(
    video: VideoPrisma & { processingJobs: ProcessingJobWithStatusHistoryAndNotification[] },
  ): Video {
    return Video.restore({
      id: video.id,
      userId: video.userId,
      name: video.name,
      originalKey: video.originalKey,
      description: video.description ?? undefined,
      createdAt: video.createdAt,
      processingJobs: video.processingJobs.map((job) =>
        ProcessingJob.restore({
          id: job.id,
          videoId: job.videoId,
          requestedAt: job.requestedAt,
          statusHistory: job.statusHistory.map((statusHistory) =>
            JobStatusHistory.restore({
              id: statusHistory.id,
              jobId: statusHistory.jobId,
              status: statusHistory.status as JobStatus,
              changedAt: statusHistory.changedAt,
            }),
          ),
          notifications: job.Notification.map((notification) =>
            Notification.restore({
              id: notification.id,
              userId: notification.userId,
              channel: notification.channel as Channel,
              payload: notification.payload,
              sentAt: notification.sentAt,
              jobId: notification.jobId ?? undefined,
            }),
          ),
        }),
      ),
    });
  }
}
