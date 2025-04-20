import { Entity } from '@/domain/common/entity';
import { Channel } from '@/domain/enums/channel';
import { JobStatus } from '../enums/job-status';

export type NotificationPayload = {
  status: JobStatus;
  videoId: string;
  videoName: string;
  notificationChannel: Channel;
  email?: string;
  failureReason?: string;
};

export class Notification extends Entity<string> {
  private _userId: string;
  private _jobId?: string;
  private _channel: Channel;
  private _sentAt: Date;
  private _payload: NotificationPayload;
  private _userEmail?: string;

  constructor(
    id: string,
    userId: string,
    channel: Channel,
    payload: NotificationPayload,
    sentAt: Date = new Date(),
    jobId?: string,
  ) {
    super(id);
    this._userId = userId;
    this._channel = channel;
    this._payload = payload;
    this._sentAt = sentAt;
    this._jobId = jobId;
  }

  static create(params: {
    userId: string;
    channel: Channel;
    payload: NotificationPayload;
    jobId?: string;
  }): Notification {
    return new Notification(
      crypto.randomUUID(),
      params.userId,
      params.channel,
      params.payload,
      new Date(),
      params.jobId,
    );
  }

  static restore(params: {
    id: string;
    userId: string;
    channel: Channel;
    payload: any;
    sentAt: Date;
    jobId?: string;
  }): Notification {
    return new Notification(
      params.id,
      params.userId,
      params.channel,
      params.payload,
      params.sentAt,
      params.jobId,
    );
  }

  get userId(): string {
    return this._userId;
  }

  get jobId(): string | undefined {
    return this._jobId;
  }

  get channel(): Channel {
    return this._channel;
  }

  get sentAt(): Date {
    return this._sentAt;
  }

  get payload(): any {
    return this._payload;
  }

  get userEmail(): string | undefined {
    return this._userEmail;
  }

  set userEmail(email: string | undefined) {
    this._userEmail = email;
    this._payload.email = email;
  }
}
