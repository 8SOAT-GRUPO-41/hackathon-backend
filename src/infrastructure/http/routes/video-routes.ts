import { makeCreateVideoController } from '@/infrastructure/factories/videos-controller-factory';
import { errorResponseSchema } from '@/infrastructure/swagger/error-response-schema';
import { ErrorCodes } from '@/domain/enums/error-codes';
import type { HttpRoute } from '@/infrastructure/http/interfaces';
import {
  makeGetZipVideoDownloadUrlController,
  makeGetUserVideosController,
} from '@/infrastructure/factories/user-controller-factory';
export const videoRoutes: HttpRoute[] = [
  {
    method: 'post',
    url: '/videos',
    handler: makeCreateVideoController,
    protected: true,
    schema: {
      tags: ['Videos'],
      summary: 'Create a new video',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            videoId: { type: 'string' },
            uploadPresignedUrl: { type: 'string' },
          },
        },
        400: errorResponseSchema(400, ErrorCodes.BAD_REQUEST),
        409: errorResponseSchema(409, ErrorCodes.CONFLICT_ERROR),
        422: errorResponseSchema(422, ErrorCodes.UNPROCESSABLE_ENTITY),
        500: errorResponseSchema(500, ErrorCodes.INTERNAL_SERVER_ERROR),
      },
    },
  },
  {
    method: 'get',
    url: '/videos/user/:userId',
    handler: makeGetUserVideosController,
    protected: true,
    schema: {
      tags: ['Videos'],
      summary: 'Get all videos for a user',
      response: {},
    },
  },
  {
    method: 'get',
    url: '/videos/download/:videoId',
    handler: makeGetZipVideoDownloadUrlController,
    protected: true,
    schema: {
      tags: ['Videos'],
      summary: 'Get the download url for a video',
      response: {},
    },
  },
];
