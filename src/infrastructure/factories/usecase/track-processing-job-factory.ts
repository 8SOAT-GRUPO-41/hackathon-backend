import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { makeVideoRepository } from '../repository/video-repository-factory';

export const makeTrackProcessingJob = () => {
  return new TrackProcessingJob(makeVideoRepository());
};
