import { Entity } from '@/domain/common/entity';
import { JobStatus } from '@/domain/enums/job-status';

export class JobStatusHistory extends Entity<number> {
  private _jobId: string;
  private _status: JobStatus;
  private _changedAt: Date;

  constructor(jobId: string, status: JobStatus, changedAt: Date = new Date()) {
    // Here the id is managed by the database (auto-increment). In memory you may leave it unset.
    super(0);
    this._jobId = jobId;
    this._status = status;
    this._changedAt = changedAt;
  }

  get jobId(): string {
    return this._jobId;
  }

  get status(): JobStatus {
    return this._status;
  }

  get changedAt(): Date {
    return this._changedAt;
  }
}
