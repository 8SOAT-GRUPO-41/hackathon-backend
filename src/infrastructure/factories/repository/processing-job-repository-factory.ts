import { ProcessingJobRepository } from '@/infrastructure/repository/job-repository';

export const makeProcessingJobRepository = () => {
  return new ProcessingJobRepository();
};
