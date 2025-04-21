import { videoRoutes } from '@/infrastructure/http/routes/video-routes';
import { makeCreateVideoController } from '@/infrastructure/factories/videos-controller-factory';
import {
  makeGetUserVideosController,
  makeGetZipVideoDownloadUrlController,
} from '@/infrastructure/factories/user-controller-factory';

// Mock das factories
jest.mock('@/infrastructure/factories/videos-controller-factory', () => ({
  makeCreateVideoController: jest.fn(),
}));

jest.mock('@/infrastructure/factories/user-controller-factory', () => ({
  makeGetUserVideosController: jest.fn(),
  makeGetZipVideoDownloadUrlController: jest.fn(),
}));

describe('Video Routes', () => {
  it('should have the correct number of routes', () => {
    expect(videoRoutes).toHaveLength(3);
  });

  describe('Create Video route', () => {
    const createVideoRoute = videoRoutes.find((route) => route.url === '/videos');

    it('should exist', () => {
      expect(createVideoRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(createVideoRoute?.method).toBe('post');
    });

    it('should use the correct handler factory', () => {
      expect(createVideoRoute?.handler).toBe(makeCreateVideoController);
    });

    it('should be protected', () => {
      expect(createVideoRoute?.protected).toBe(true);
    });

    it('should have valid schema with required fields', () => {
      const schema = createVideoRoute?.schema;
      expect(schema).toBeDefined();
      expect(schema?.body?.properties).toHaveProperty('name');
      expect(schema?.body?.properties).toHaveProperty('description');
      expect(schema?.body?.required).toContain('name');
    });
  });

  describe('Get User Videos route', () => {
    const getUserVideosRoute = videoRoutes.find((route) => route.url === '/videos/user/:userId');

    it('should exist', () => {
      expect(getUserVideosRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(getUserVideosRoute?.method).toBe('get');
    });

    it('should use the correct handler factory', () => {
      expect(getUserVideosRoute?.handler).toBe(makeGetUserVideosController);
    });

    it('should be protected', () => {
      expect(getUserVideosRoute?.protected).toBe(true);
    });

    it('should have a schema defined', () => {
      const schema = getUserVideosRoute?.schema;
      expect(schema).toBeDefined();
    });
  });

  describe('Get Download URL route', () => {
    const getDownloadRoute = videoRoutes.find((route) => route.url === '/videos/download/:videoId');

    it('should exist', () => {
      expect(getDownloadRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(getDownloadRoute?.method).toBe('get');
    });

    it('should use the correct handler factory', () => {
      expect(getDownloadRoute?.handler).toBe(makeGetZipVideoDownloadUrlController);
    });

    it('should be protected', () => {
      expect(getDownloadRoute?.protected).toBe(true);
    });

    it('should have a schema defined', () => {
      const schema = getDownloadRoute?.schema;
      expect(schema).toBeDefined();
    });
  });
});
