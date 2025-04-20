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
    await prisma.$transaction(async (tx) => {
      await tx.video.upsert({
        where: { id: video.id },
        create: {
          id: video.id,
          userId: video.userId,
          name: video.name,
          originalKey: video.originalKey,
          description: video.description,
          createdAt: video.createdAt,
          resultKey: video.resultKey,
        },
        update: {
          name: video.name,
          originalKey: video.originalKey,
          description: video.description,
          resultKey: video.resultKey,
        },
      });

      const job = video.processingJob;
      if (!job) {
        return;
      }

      await tx.processingJob.upsert({
        where: { id: job.id },
        create: {
          id: job.id,
          videoId: job.videoId,
          requestedAt: job.requestedAt,
          startedAt: job.startedAt,
          finishedAt: job.finishedAt,
          errorMessage: job.errorMessage,
        },
        update: {
          requestedAt: job.requestedAt,
          startedAt: job.startedAt,
          finishedAt: job.finishedAt,
          errorMessage: job.errorMessage,
        },
      });

      await tx.jobStatusHistory.deleteMany({
        where: { jobId: job.id },
      });
      if (job.statusHistory.length) {
        await tx.jobStatusHistory.createMany({
          data: job.statusHistory.map((h) => ({
            jobId: h.jobId,
            status: h.status,
            changedAt: h.changedAt,
          })),
        });
      }

      for (const n of job.notifications) {
        await tx.notification.upsert({
          where: { id: n.id },
          create: {
            id: n.id,
            userId: n.userId,
            channel: n.channel,
            payload: n.payload,
            sentAt: n.sentAt,
            jobId: n.jobId,
          },
          update: {
            userId: n.userId,
            channel: n.channel,
            payload: n.payload,
            sentAt: n.sentAt,
            jobId: n.jobId,
          },
        });
      }
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
      processingJob: video.processingJobs
        .map((job) =>
          ProcessingJob.restore({
            id: job.id,
            videoId: job.videoId,
            requestedAt: job.requestedAt,
            statusHistory: job.statusHistory.map((statusHistory) =>
              JobStatusHistory.restore({
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
        )
        .shift(),
    });
  }
}
