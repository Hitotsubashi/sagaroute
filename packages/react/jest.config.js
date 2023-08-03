const globalJestConfig = require('../../jest.config');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...globalJestConfig,
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  silent: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^～/(.*)$': '<rootDir>/$1',
    '^#/(.*)$': '<rootDir>/__tests__/$1',
  },
};
