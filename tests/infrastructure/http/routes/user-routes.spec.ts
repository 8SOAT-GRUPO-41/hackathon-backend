import { userRoutes } from '@/infrastructure/http/routes/user-routes';
import {
  makeCreateUserController,
  makeDeleteUserController,
} from '@/infrastructure/factories/user-controller-factory';

// Mock das factories
jest.mock('@/infrastructure/factories/user-controller-factory', () => ({
  makeCreateUserController: jest.fn(),
  makeDeleteUserController: jest.fn(),
}));

describe('User Routes', () => {
  it('should have the correct number of routes', () => {
    expect(userRoutes).toHaveLength(2);
  });

  describe('Create User route', () => {
    const createUserRoute = userRoutes.find((route) => route.url === '/users');

    it('should exist', () => {
      expect(createUserRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(createUserRoute?.method).toBe('post');
    });

    it('should use the correct handler factory', () => {
      expect(createUserRoute?.handler).toBe(makeCreateUserController);
    });

    it('should not be protected', () => {
      expect(createUserRoute?.protected).toBeUndefined();
    });

    it('should have valid schema with required fields', () => {
      const schema = createUserRoute?.schema;
      expect(schema).toBeDefined();
      expect(schema?.body?.properties).toHaveProperty('email');
      expect(schema?.body?.properties).toHaveProperty('password');
      expect(schema?.body?.required).toContain('email');
      expect(schema?.body?.required).toContain('password');
    });
  });

  describe('Delete User route', () => {
    const deleteUserRoute = userRoutes.find((route) => route.url === '/users/:id');

    it('should exist', () => {
      expect(deleteUserRoute).toBeDefined();
    });

    it('should have correct method', () => {
      expect(deleteUserRoute?.method).toBe('delete');
    });

    it('should use the correct handler factory', () => {
      expect(deleteUserRoute?.handler).toBe(makeDeleteUserController);
    });

    it('should be protected', () => {
      expect(deleteUserRoute?.protected).toBe(true);
    });

    it('should have valid schema with required params', () => {
      const schema = deleteUserRoute?.schema;
      expect(schema).toBeDefined();

      // Usando type casting para contornar a verificação de tipos
      const schemaAny = schema as Record<string, any>;
      expect(schemaAny.params?.properties).toHaveProperty('id');
      expect(schemaAny.params?.required).toContain('id');
    });
  });
});
