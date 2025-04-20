import { Controller } from '../controllers/interfaces';
import { CreateProcessingJobController } from '../controllers/job/create-job-controller';
import { UpdateProcessingJobController } from '../controllers/job/update-job-controller';
import { CreateProcessingJob } from '@/application/usecases/job/create-job';
import { UpdateProcessingJob } from '@/application/usecases/job/update-job';
import { ProcessingJobRepository } from '../repository/job-repository';

const makeProcessingJobRepository = (): ProcessingJobRepository => {
  return new ProcessingJobRepository();
};

const makeCreateProcessingJob = (): CreateProcessingJob => {
  return new CreateProcessingJob(makeProcessingJobRepository());
};

const makeUpdateProcessingJob = (): UpdateProcessingJob => {
  return new UpdateProcessingJob(makeProcessingJobRepository());
};

export const makeCreateProcessingJobController = (): Controller => {
  return new CreateProcessingJobController(makeCreateProcessingJob());
};

export const makeUpdateProcessingJobController = (): Controller => {
  return new UpdateProcessingJobController(makeUpdateProcessingJob());
};
