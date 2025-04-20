import { ProcessingJob } from '../entities/processing-job';

export interface IProcessingJobRepository {
  findById(id: string): Promise<ProcessingJob | null>;
  save(job: ProcessingJob): Promise<void>;
  delete(job: ProcessingJob): Promise<void>;
}
