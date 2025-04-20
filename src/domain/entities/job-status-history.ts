import { Entity } from '@/domain/common/entity';
import { JobStatus } from '@/domain/enums/job-status';

export class JobStatusHistory extends Entity<number> {
  private _jobId: string;
  private _status: JobStatus;
  private _changedAt: Date;

  constructor(jobId: string, status: JobStatus, changedAt: Date = new Date()) {
    super(0);
    this._jobId = jobId;
    this._status = status;
    this._changedAt = changedAt;
  }

  static restore(params: { jobId: string; status: JobStatus; changedAt: Date }): JobStatusHistory {
    return new JobStatusHistory(params.jobId, params.status, params.changedAt);
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

  toJSON() {
    return {
      jobId: this.jobId,
      status: this.status,
      changedAt: this.changedAt,
    };
  }
}
