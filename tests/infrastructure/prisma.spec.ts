import prisma from '@/infrastructure/prisma';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe('Prisma Client', () => {
  it('should be an instance of PrismaClient', () => {
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(prisma).toBeDefined();
  });
});
