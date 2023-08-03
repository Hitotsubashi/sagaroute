/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "/node_modules/",
    "/ignore-test(.*)?/",
    "/_toolkits/",
    "/__tests__/(.*)?/src",
    "sagaroute.config.js",
  ],
};
