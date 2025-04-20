import { Entity } from '@/domain/common/entity';
import { JobStatusHistory } from '@/domain/entities/job-status-history';
import { Notification } from '@/domain/entities/notification';
import { JobStatus } from '@/domain/enums/job-status';

export class ProcessingJob extends Entity<string> {
  private _videoId: string;
  private _requestedAt: Date;
  private _startedAt?: Date;
  private _finishedAt?: Date;
  private _errorMessage?: string;
  private _statusHistory: JobStatusHistory[];
  private _notifications: Notification[];

  constructor(
    id: string,
    videoId: string,
    requestedAt: Date = new Date(),
    statusHistory: JobStatusHistory[] = [],
    notifications: Notification[] = [],
    startedAt?: Date,
    finishedAt?: Date,
    errorMessage?: string,
  ) {
    super(id);
    this._videoId = videoId;
    this._requestedAt = requestedAt;
    this._statusHistory = statusHistory;
    this._notifications = notifications;
    this._startedAt = startedAt;
    this._finishedAt = finishedAt;
    this._errorMessage = errorMessage;
  }

  static create(videoId: string): ProcessingJob {
    const job = new ProcessingJob(crypto.randomUUID(), videoId, new Date());
    job.updateStatus(JobStatus.QUEUED);
    return job;
  }

  static restore(params: {
    id: string;
    videoId: string;
    requestedAt: Date;
    statusHistory: JobStatusHistory[];
    notifications: Notification[];
    startedAt?: Date;
    finishedAt?: Date;
    errorMessage?: string;
  }): ProcessingJob {
    return new ProcessingJob(
      params.id,
      params.videoId,
      params.requestedAt,
      params.statusHistory,
      params.notifications,
      params.startedAt,
      params.finishedAt,
      params.errorMessage,
    );
  }

  get videoId(): string {
    return this._videoId;
  }

  get requestedAt(): Date {
    return this._requestedAt;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get finishedAt(): Date | undefined {
    return this._finishedAt;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  get statusHistory(): JobStatusHistory[] {
    return this._statusHistory;
  }

  get notifications(): Notification[] {
    return this._notifications;
  }

  get currentStatus(): JobStatus | undefined {
    if (this._statusHistory.length === 0) {
      return undefined;
    }

    const sortedHistory = [...this._statusHistory].sort(
      (a, b) => b.changedAt.getTime() - a.changedAt.getTime(),
    );

    return sortedHistory[0].status;
  }

  addStatusHistory(history: JobStatusHistory): void {
    this._statusHistory.push(history);
  }

  addNotification(notification: Notification): void {
    this._notifications.push(notification);
  }

  updateStatus(newStatus: JobStatus): void {
    const currentStatus = this.currentStatus;

    if (currentStatus === JobStatus.COMPLETED || currentStatus === JobStatus.FAILED) {
      return;
    }

    if (
      newStatus === JobStatus.RUNNING &&
      (!this._startedAt || this.isValidTransition(currentStatus, newStatus))
    ) {
      this._startedAt = new Date();
    } else if (
      (newStatus === JobStatus.COMPLETED || newStatus === JobStatus.FAILED) &&
      this.isValidTransition(currentStatus, newStatus)
    ) {
      this._finishedAt = new Date();

      if (newStatus === JobStatus.FAILED && this._errorMessage === undefined) {
        this._errorMessage = 'Processing failed';
      }
    }

    if (this.isValidTransition(currentStatus, newStatus)) {
      const history = new JobStatusHistory(this.id, newStatus);
      this.addStatusHistory(history);
    }
  }

  private isValidTransition(currentStatus: JobStatus | undefined, newStatus: JobStatus): boolean {
    if (currentStatus === undefined && newStatus === JobStatus.QUEUED) {
      return true;
    }

    const validTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.QUEUED]: [JobStatus.RUNNING, JobStatus.FAILED],
      [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
    };

    return currentStatus !== undefined && validTransitions[currentStatus].includes(newStatus);
  }

  toJSON() {
    return {
      id: this.id,
      videoId: this.videoId,
      requestedAt: this.requestedAt,
      statusHistory: this.statusHistory.map((statusHistory) => statusHistory.toJSON()),
      notifications: this.notifications,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      errorMessage: this.errorMessage,
      currentStatus: this.currentStatus,
    };
  }
}
