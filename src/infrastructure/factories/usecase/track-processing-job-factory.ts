import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { makeProcessingJobRepository } from '../repository/processing-job-repository-factory';
import { makeVideoRepository } from '../repository/video-repository-factory';

export const makeTrackProcessingJob = () => {
  return new TrackProcessingJob(makeVideoRepository(), makeProcessingJobRepository());
};
