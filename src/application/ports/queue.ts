import { JobStatus } from '@/domain/enums/job-status';

export interface IQueueService {
  sendMessage(
    videoId: string,
    videoName: string,
    status: JobStatus,
    failureReason?: string,
  ): Promise<void>;
}
