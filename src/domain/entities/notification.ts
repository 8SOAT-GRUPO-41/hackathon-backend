import { Entity } from '@/domain/common/entity';
import { Channel } from '@/domain/enums/channel';

export class Notification extends Entity<string> {
  private _userId: string;
  private _jobId?: string;
  private _channel: Channel;
  private _sentAt: Date;
  private _payload: any; // Replace `any` with a more specific type if available

  constructor(
    id: string,
    userId: string,
    channel: Channel,
    payload: any,
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
}
