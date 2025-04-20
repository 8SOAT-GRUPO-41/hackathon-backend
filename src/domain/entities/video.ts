import { Entity } from '@/domain/common/entity';
import { ProcessingJob } from '@/domain/entities/processing-job';

export class Video extends Entity<string> {
  private _userId: string;
  private _originalKey: string;
  private _resultKey?: string;
  private _createdAt: Date;
  private _processingJobs: ProcessingJob[];
  private _presignedUrl?: string;

  constructor(
    id: string,
    userId: string,
    public name: string,
    originalKey: string,
    public description?: string,
    createdAt: Date = new Date(),
    processingJobs: ProcessingJob[] = [],
    resultKey?: string,
    presignedUrl?: string,
  ) {
    super(id);
    this._userId = userId;
    this._originalKey = originalKey;
    this._createdAt = createdAt;
    this._processingJobs = processingJobs;
    this._resultKey = resultKey;
    this._presignedUrl = presignedUrl;
  }

  static create(userId: string, name: string, originalKey: string, description?: string): Video {
    return new Video(crypto.randomUUID(), userId, name, originalKey, description, new Date(), []);
  }

  get userId(): string {
    return this._userId;
  }

  get originalKey(): string {
    return this._originalKey;
  }

  get resultKey(): string | undefined {
    return this._resultKey;
  }

  set resultKey(key: string | undefined) {
    this._resultKey = key;
  }

  setPresignedUrl(url: string) {
    this._presignedUrl = url;
  }

  get presignedUrl(): string | undefined {
    return this._presignedUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get processingJobs(): ProcessingJob[] {
    return this._processingJobs;
  }

  addProcessingJob(job: ProcessingJob): void {
    this._processingJobs.push(job);
  }
}
