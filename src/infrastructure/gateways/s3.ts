import { IStorageService } from '@/application/ports/storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3Gateway implements IStorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly bucketName: string = process.env.AWS_S3_BUCKET!) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getUploadPresignedUrl(params: {
    fileKey: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<string> {
    const { fileKey, contentType, expiresIn = 3600 } = params;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
    return url;
  }

  async getDownloadPresignedUrl(params: { fileKey: string; expiresIn?: number }): Promise<string> {
    const { fileKey, expiresIn = 3600 } = params;
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
    return url;
  }
}
