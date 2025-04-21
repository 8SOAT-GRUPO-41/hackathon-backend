import { ProcessingJob } from '@/domain/entities/processing-job';
import { JobStatus } from '@/domain/enums/job-status';
import { IProcessingJobRepository } from '@/domain/repository/job-repository';

class MockJobRepository implements IProcessingJobRepository {
  private jobs: ProcessingJob[] = [];

  async findById(id: string): Promise<ProcessingJob | null> {
    const job = this.jobs.find((j) => j.id === id);
    return job || null;
  }

  async delete(job: ProcessingJob): Promise<void> {
    this.jobs = this.jobs.filter((j) => j.id !== job.id);
  }

  async save(job: ProcessingJob): Promise<void> {
    const index = this.jobs.findIndex((j) => j.id === job.id);
    if (index >= 0) {
      this.jobs[index] = job;
    } else {
      this.jobs.push(job);
    }
  }

  // Helper method to get all jobs for testing
  async findAll(): Promise<ProcessingJob[]> {
    return [...this.jobs];
  }
}

describe('JobRepository Interface', () => {
  let repository: IProcessingJobRepository;
  let job: ProcessingJob;
  const videoId = 'video-id-123';
  const jobId = 'job-id-123';

  beforeEach(() => {
    repository = new MockJobRepository();
    job = new ProcessingJob(jobId, videoId, new Date());

    // Set up the job status to QUEUED
    job.updateStatus(JobStatus.QUEUED);
  });

  describe('findById', () => {
    it('should return the job when found by id', async () => {
      await repository.save(job);

      const result = await repository.findById(job.id);

      expect(result).toEqual(job);
      expect(result?.id).toBe(jobId);
      expect(result?.videoId).toBe(videoId);
      expect(result?.currentStatus).toBe(JobStatus.QUEUED);
    });

    it('should return null when job is not found by id', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should add a new job when it does not exist', async () => {
      await repository.save(job);

      const savedJob = await repository.findById(job.id);

      expect(savedJob).toEqual(job);
      expect(savedJob?.id).toBe(jobId);
    });

    it('should update an existing job', async () => {
      await repository.save(job);

      // Update the job status
      job.updateStatus(JobStatus.RUNNING);

      await repository.save(job);

      const result = await repository.findById(job.id);

      expect(result).toEqual(job);
      expect(result?.currentStatus).toBe(JobStatus.QUEUED);
    });
  });

  describe('delete', () => {
    it('should remove a job from the repository', async () => {
      await repository.save(job);

      await repository.delete(job);

      const result = await repository.findById(job.id);

      expect(result).toBeNull();
    });

    it('should not affect other jobs when deleting a specific job', async () => {
      // Create and save first job
      await repository.save(job);

      // Create and save second job
      const secondJob = new ProcessingJob('job-id-456', 'video-id-456', new Date());
      secondJob.updateStatus(JobStatus.QUEUED);
      await repository.save(secondJob);

      // Delete only the first job
      await repository.delete(job);

      // First job should be gone
      const firstJobResult = await repository.findById(job.id);
      expect(firstJobResult).toBeNull();

      // Second job should still exist
      const secondJobResult = await repository.findById(secondJob.id);
      expect(secondJobResult).toEqual(secondJob);
    });
  });
});
