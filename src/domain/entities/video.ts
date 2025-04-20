import { Entity } from '@/domain/common/entity';
import { ProcessingJob } from '@/domain/entities/processing-job';

export class Video extends Entity<string> {
  private _userId: string;
  private _originalKey: string;
  private _resultKey?: string;
  private _createdAt: Date;
  private _processingJobs: ProcessingJob[];

  constructor(
    id: string,
    userId: string,
    originalKey: string,
    createdAt: Date = new Date(),
    processingJobs: ProcessingJob[] = [],
    resultKey?: string,
  ) {
    super(id);
    this._userId = userId;
    this._originalKey = originalKey;
    this._createdAt = createdAt;
    this._processingJobs = processingJobs;
    this._resultKey = resultKey;
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
