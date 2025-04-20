import { TrackProcessingJobController } from '../../controllers/job/track-processing-job-controller';
import { makeTrackProcessingJob } from '../usecase/track-processing-job-factory';

export const makeTrackProcessingJobController = () => {
  return new TrackProcessingJobController(makeTrackProcessingJob());
};
