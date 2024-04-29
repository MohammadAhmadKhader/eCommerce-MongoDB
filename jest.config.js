/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch:["**/**/*.test.ts"],
  verbose:true,
  forceExit:true,
  testTimeout:30000,
  detectOpenHandles:true,
  testPathIgnorePatterns:["./src/__tests__/utils"],
  clearMocks:true
};