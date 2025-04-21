import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Gateway } from '@/infrastructure/gateways/s3';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({})),
    GetObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Gateway', () => {
  let s3Gateway: S3Gateway;
  const mockBucketName = 'test-bucket';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_SESSION_TOKEN = 'test-token';

    s3Gateway = new S3Gateway(mockBucketName);
  });

  describe('getUploadPresignedUrl', () => {
    it('should call getSignedUrl with correct parameters', async () => {
      const fileKey = 'test-file.mp4';
      const contentType = 'video/mp4';
      const expiresIn = 1800;
      const mockSignedUrl = 'https://test-signed-url.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      const result = await s3Gateway.getUploadPresignedUrl({
        fileKey,
        contentType,
        expiresIn,
      });

      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: fileKey,
        ContentType: contentType,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(PutObjectCommand), {
        expiresIn,
      });

      expect(result).toBe(mockSignedUrl);
    });

    it('should use default expiresIn when not provided', async () => {
      const fileKey = 'test-file.mp4';
      const contentType = 'video/mp4';
      const mockSignedUrl = 'https://test-signed-url.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      await s3Gateway.getUploadPresignedUrl({
        fileKey,
        contentType,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(PutObjectCommand), {
        expiresIn: 3600,
      });
    });
  });

  describe('getDownloadPresignedUrl', () => {
    it('should call getSignedUrl with correct parameters', async () => {
      const fileKey = 'test-file.mp4';
      const expiresIn = 1800;
      const mockSignedUrl = 'https://test-signed-url.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      const result = await s3Gateway.getDownloadPresignedUrl({
        fileKey,
        expiresIn,
      });

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: mockBucketName,
        Key: fileKey,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(GetObjectCommand), {
        expiresIn,
      });

      expect(result).toBe(mockSignedUrl);
    });

    it('should use default expiresIn when not provided', async () => {
      const fileKey = 'test-file.mp4';
      const mockSignedUrl = 'https://test-signed-url.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

      await s3Gateway.getDownloadPresignedUrl({
        fileKey,
      });

      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(GetObjectCommand), {
        expiresIn: 3600,
      });
    });
  });
});
