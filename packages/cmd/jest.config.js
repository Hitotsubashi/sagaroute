/* eslint-env node */
const globalJestConfig = require('../../jest.config');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...globalJestConfig,
  rootDir: './',
  silent: true,
};
