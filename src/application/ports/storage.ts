export interface IStorageService {
  getUploadPresignedUrl(params: {
    fileKey: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<string>;
  getDownloadPresignedUrl(params: { fileKey: string; expiresIn?: number }): Promise<string>;
}
