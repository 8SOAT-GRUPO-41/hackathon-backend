import { CreateProcessingJob } from '@/application/usecases/job/create-job';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { JobStatus } from '@/domain/enums/job-status';
import { CreateProcessingJobController } from '@/infrastructure/controllers/job/create-job-controller';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('CreateProcessingJobController', () => {
  let createJobController: CreateProcessingJobController;
  let createJobMock: jest.Mocked<CreateProcessingJob>;

  beforeEach(() => {
    createJobMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateProcessingJob>;

    createJobController = new CreateProcessingJobController(createJobMock);
  });

  it('should call CreateProcessingJob with correct values', async () => {
    const httpRequest: HttpRequest<{ videoId: string }> = {
      body: {
        videoId: 'any_video_id',
      },
      query: {},
      params: {},
      headers: {},
    };

    await createJobController.handle(httpRequest);

    expect(createJobMock.execute).toHaveBeenCalledWith({
      videoId: 'any_video_id',
    });
  });

  it('should return 201 with job data on success', async () => {
    const httpRequest: HttpRequest<{ videoId: string }> = {
      body: {
        videoId: 'any_video_id',
      },
      query: {},
      params: {},
      headers: {},
    };

    const mockJob = ProcessingJob.create('any_video_id');
    createJobMock.execute.mockResolvedValue(mockJob);

    const httpResponse = await createJobController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(HttpStatusCode.CREATED);
    expect(httpResponse.body).toBe(mockJob);
  });
});
