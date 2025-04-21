import { UpdateProcessingJob } from '@/application/usecases/job/update-job';
import { ProcessingJob } from '@/domain/entities/processing-job';
import { JobStatus } from '@/domain/enums/job-status';
import { UpdateProcessingJobController } from '@/infrastructure/controllers/job/update-job-controller';
import { HttpStatusCode } from '@/infrastructure/http/helper';
import { HttpRequest } from '@/infrastructure/http/interfaces';

describe('UpdateProcessingJobController', () => {
  let updateJobController: UpdateProcessingJobController;
  let updateJobMock: jest.Mocked<UpdateProcessingJob>;

  beforeEach(() => {
    updateJobMock = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateProcessingJob>;

    updateJobController = new UpdateProcessingJobController(updateJobMock);
  });

  it('should call UpdateProcessingJob with correct values', async () => {
    const httpRequest: HttpRequest<{ jobId: string; status: JobStatus }> = {
      body: {
        jobId: 'any_job_id',
        status: JobStatus.COMPLETED,
      },
      query: {},
      params: {},
      headers: {},
    };

    await updateJobController.handle(httpRequest);

    expect(updateJobMock.execute).toHaveBeenCalledWith({
      jobId: 'any_job_id',
      status: JobStatus.COMPLETED,
    });
  });

  it('should ignore additional properties not handled by the controller', async () => {
    const httpRequest: HttpRequest<{ jobId: string; status: JobStatus; errorMessage?: string }> = {
      body: {
        jobId: 'any_job_id',
        status: JobStatus.FAILED,
        errorMessage: 'Processing failed', // Este campo será ignorado pelo controller
      },
      query: {},
      params: {},
      headers: {},
    };

    await updateJobController.handle(httpRequest);

    // Verificamos apenas os campos que o controller realmente usa
    expect(updateJobMock.execute).toHaveBeenCalledWith({
      jobId: 'any_job_id',
      status: JobStatus.FAILED,
    });
  });

  it('should return 200 with updated job on success', async () => {
    const httpRequest: HttpRequest<{ jobId: string; status: JobStatus }> = {
      body: {
        jobId: 'any_job_id',
        status: JobStatus.COMPLETED,
      },
      query: {},
      params: {},
      headers: {},
    };

    const mockJob = ProcessingJob.create('any_video_id');
    mockJob.updateStatus(JobStatus.COMPLETED);
    updateJobMock.execute.mockResolvedValue(mockJob);

    const httpResponse = await updateJobController.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(HttpStatusCode.OK);
    expect(httpResponse.body).toBe(mockJob);
  });
});
