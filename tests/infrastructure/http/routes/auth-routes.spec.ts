import { authRoutes } from '@/infrastructure/http/routes/auth-routes';
import {
  makeAuthenticateController,
  makeRefreshTokenController,
  makeSignUpController,
} from '@/infrastructure/factories/auth-factories';
import { makeSignInController } from '@/infrastructure/factories/user-controller-factory';

// Mock das factories
jest.mock('@/infrastructure/factories/auth-factories', () => ({
  makeAuthenticateController: jest.fn(),
  makeRefreshTokenController: jest.fn(),
  makeSignUpController: jest.fn(),
}));

jest.mock('@/infrastructure/factories/user-controller-factory', () => ({
  makeSignInController: jest.fn(),
}));

describe('Auth Routes', () => {
  it('should have the correct number of routes', () => {
    expect(authRoutes).toHaveLength(4);
  });

  describe('Sign In route', () => {
    const signInRoute = authRoutes.find((route) => route.url === '/sign-in');

    it('should exist', () => {
      expect(signInRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(signInRoute?.method).toBe('post');
    });

    it('should use the correct handler factory', () => {
      expect(signInRoute?.handler).toBe(makeSignInController);
    });

    it('should have valid schema with required fields', () => {
      const schema = signInRoute?.schema;
      expect(schema).toBeDefined();
      expect(schema?.body?.properties).toHaveProperty('email');
      expect(schema?.body?.properties).toHaveProperty('password');
      expect(schema?.body?.required).toContain('email');
      expect(schema?.body?.required).toContain('password');
    });
  });

  describe('Login route', () => {
    const loginRoute = authRoutes.find((route) => route.url === '/login');

    it('should exist', () => {
      expect(loginRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(loginRoute?.method).toBe('post');
    });

    it('should use the correct handler factory', () => {
      expect(loginRoute?.handler).toBe(makeAuthenticateController);
    });

    it('should have valid schema with required fields', () => {
      const schema = loginRoute?.schema;
      expect(schema).toBeDefined();
      expect(schema?.body?.properties).toHaveProperty('email');
      expect(schema?.body?.properties).toHaveProperty('password');
      expect(schema?.body?.required).toContain('email');
      expect(schema?.body?.required).toContain('password');
    });
  });

  describe('Refresh Token route', () => {
    const refreshTokenRoute = authRoutes.find((route) => route.url === '/refresh-token');

    it('should exist', () => {
      expect(refreshTokenRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(refreshTokenRoute?.method).toBe('post');
    });

    it('should use the correct handler factory', () => {
      expect(refreshTokenRoute?.handler).toBe(makeRefreshTokenController);
    });

    it('should have valid schema with required fields', () => {
      const schema = refreshTokenRoute?.schema;
      expect(schema).toBeDefined();
      expect(schema?.body?.properties).toHaveProperty('refreshToken');
      expect(schema?.body?.required).toContain('refreshToken');
    });
  });

  describe('Sign Up route', () => {
    const signUpRoute = authRoutes.find((route) => route.url === '/sign-up');

    it('should exist', () => {
      expect(signUpRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(signUpRoute?.method).toBe('post');
    });

    it('should use the correct handler factory', () => {
      expect(signUpRoute?.handler).toBe(makeSignUpController);
    });

    it('should have valid schema with required fields', () => {
      const schema = signUpRoute?.schema;
      expect(schema).toBeDefined();
      expect(schema?.body?.properties).toHaveProperty('email');
      expect(schema?.body?.properties).toHaveProperty('password');
      expect(schema?.body?.required).toContain('email');
      expect(schema?.body?.required).toContain('password');
    });
  });
});
