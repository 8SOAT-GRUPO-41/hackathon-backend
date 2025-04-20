import { Entity } from '@/domain/common/entity';
import { JobStatus } from '@/domain/enums/job-status';
import { JobStatusHistory } from '@/domain/entities/job-status-history';
import { Notification } from '@/domain/entities/notification';

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
    return new ProcessingJob(crypto.randomUUID(), videoId, new Date());
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

  addStatusHistory(history: JobStatusHistory): void {
    this._statusHistory.push(history);
  }

  addNotification(notification: Notification): void {
    this._notifications.push(notification);
  }

  // Example of a domain behavior: updating job status.
  updateStatus(newStatus: JobStatus): void {
    const history = new JobStatusHistory(this.id, newStatus);
    this.addStatusHistory(history);
  }
}
