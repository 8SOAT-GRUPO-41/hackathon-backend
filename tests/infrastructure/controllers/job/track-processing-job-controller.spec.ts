import { TrackProcessingJob } from '@/application/usecases/job/track-job';
import { JobStatus } from '@/domain/enums/job-status';
import { Video } from '@/domain/entities/video';
import { Message } from '@/infrastructure/consumers/types';
import { TrackProcessingJobController } from '@/infrastructure/controllers/job/track-processing-job-controller';

describe('TrackProcessingJobController', () => {
  let trackJobController: TrackProcessingJobController;
  let trackJobMock: jest.Mocked<TrackProcessingJob>;

  beforeEach(() => {
    trackJobMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<TrackProcessingJob>;

    trackJobController = new TrackProcessingJobController(trackJobMock);
  });

  it('should call TrackProcessingJob with correct values', async () => {
    const message: Message<{ videoId: string; status: JobStatus }> = {
      messageId: 'any_message_id',
      body: {
        videoId: 'any_video_id',
        status: JobStatus.COMPLETED,
      },
    };

    // Mock do vídeo para retorno
    const mockVideo = {} as Video;
    trackJobMock.execute.mockResolvedValue({
      video: mockVideo,
      statusUpdated: true,
      currentStatus: JobStatus.COMPLETED,
    });

    await trackJobController.handle(message);

    expect(trackJobMock.execute).toHaveBeenCalledWith({
      videoId: 'any_video_id',
      jobStatus: JobStatus.COMPLETED,
    });
  });

  it('should return success true when tracking is successful', async () => {
    const message: Message<{ videoId: string; status: JobStatus }> = {
      messageId: 'any_message_id',
      body: {
        videoId: 'any_video_id',
        status: JobStatus.COMPLETED,
      },
    };

    // Mock do vídeo para retorno
    const mockVideo = {} as Video;
    trackJobMock.execute.mockResolvedValue({
      video: mockVideo,
      statusUpdated: true,
      currentStatus: JobStatus.COMPLETED,
    });

    const result = await trackJobController.handle(message);

    expect(result).toEqual({ success: true });
  });
});
