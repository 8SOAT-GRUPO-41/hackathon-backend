import { IProcessingJobRepository } from '@/domain/repository/job-repository';
import prisma from '../prisma';
import { ProcessingJob } from '@/domain/entities/processing-job';

// TODO: add job status history
export class ProcessingJobRepository implements IProcessingJobRepository {
  async findById(id: string): Promise<ProcessingJob | null> {
    const job = await prisma.processingJob.findUnique({
      where: { id },
      include: {
        statusHistory: true,
        Notification: true,
      },
    });
    if (!job) {
      return null;
    }
    return new ProcessingJob(
      job.id,
      job.videoId,
      job.requestedAt,
      [],
      [],
      job.startedAt ?? undefined,
      job.finishedAt ?? undefined,
      job.errorMessage ?? undefined,
    );
  }

  async save(job: ProcessingJob): Promise<void> {
    await prisma.processingJob.create({
      data: {
        id: job.id,
        videoId: job.videoId,
        requestedAt: job.requestedAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        errorMessage: job.errorMessage,
        statusHistory: {
          create: job.statusHistory.map((statusHistory) => ({
            jobId: statusHistory.jobId,
            status: statusHistory.status,
          })),
        },
      },
    });
  }

  async delete(job: ProcessingJob): Promise<void> {
    await prisma.processingJob.delete({
      where: { id: job.id },
    });
  }
}
