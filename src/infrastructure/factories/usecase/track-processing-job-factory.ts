import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { makeVideoRepository } from '../repository/video-repository-factory';
import { makeSqsProducer } from '../queue/sqs-producer-factory';
export const makeTrackProcessingJob = () => {
  return new TrackProcessingJob(makeVideoRepository(), makeSqsProducer());
};
