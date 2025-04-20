import { S3Gateway } from '../gateways/s3';

export const makeS3Gateway = () => {
  return new S3Gateway();
};
