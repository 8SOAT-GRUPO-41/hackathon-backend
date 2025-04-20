import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { makeSqsProducer } from '../queue/sqs-producer-factory';
import { makeVideoRepository } from '../repository/video-repository-factory';
import { makeUserRepository } from '../user-controller-factory';

export const makeTrackProcessingJob = () => {
  return new TrackProcessingJob(makeVideoRepository(), makeSqsProducer(), makeUserRepository());
};
