/** @type {import('ts-jest').JestConfigWithTsJest} */
require('dotenv').config({ path: '.env.test' });
module.exports = {
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/main/**',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/protocols/**',
    '!<rootDir>/src/**/infrastructure/factories/**',
    '!<rootDir>/src/**/infrastructure/swagger/**',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@/tests/(.*)': '<rootDir>/tests/$1',
    '@/(.*)': '<rootDir>/src/$1',
  },
  setupFiles: ['dotenv/config'],
  verbose: true,
  silent: false,
  reporters: ['default'],
  setupFilesAfterEnv: ['jest-extended'],
  testMatch: ['**/*.steps.ts', '**/*.spec.ts'],
};
