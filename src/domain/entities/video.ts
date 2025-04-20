import { Entity } from '@/domain/common/entity';
import { ProcessingJob } from '@/domain/entities/processing-job';

export class Video extends Entity<string> {
  private _userId: string;
  private _originalKey: string;
  private _resultKey: string;
  private _createdAt: Date;
  private _processingJob?: ProcessingJob;
  private _presignedUrl?: string;

  constructor(
    id: string,
    userId: string,
    public name: string,
    originalKey: string,
    resultKey: string,
    public description?: string,
    createdAt: Date = new Date(),
    processingJob?: ProcessingJob,
    presignedUrl?: string,
  ) {
    super(id);
    this._userId = userId;
    this._originalKey = originalKey;
    this._createdAt = createdAt;
    this._processingJob = processingJob;
    this._resultKey = resultKey;
    this._presignedUrl = presignedUrl;
  }

  static create(userId: string, name: string, description?: string): Video {
    const videoId = crypto.randomUUID();
    const originalKey = `raw/${videoId}.mp4`;
    const resultKey = `frames/${videoId}.zip`;
    return new Video(videoId, userId, name, originalKey, resultKey, description, new Date());
  }

  static restore(params: {
    id: string;
    userId: string;
    name: string;
    originalKey: string;
    description?: string;
    createdAt: Date;
    processingJob?: ProcessingJob;
    resultKey: string;
    presignedUrl?: string;
  }): Video {
    return new Video(
      params.id,
      params.userId,
      params.name,
      params.originalKey,
      params.resultKey,
      params.description,
      params.createdAt,
      params.processingJob,
      params.presignedUrl,
    );
  }

  get userId(): string {
    return this._userId;
  }

  get originalKey(): string {
    return this._originalKey;
  }

  get resultKey(): string {
    return this._resultKey;
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

  get processingJob(): ProcessingJob | undefined {
    return this._processingJob;
  }

  addProcessingJob(job: ProcessingJob): void {
    this._processingJob = job;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      originalKey: this.originalKey,
      description: this.description,
      createdAt: this.createdAt,
      processingJob: this.processingJob?.toJSON(),
      resultKey: this.resultKey,
      presignedUrl: this.presignedUrl,
    };
  }
}
