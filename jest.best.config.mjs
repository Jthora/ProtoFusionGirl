// Unified "best-use-case" Jest config.
// Runs a single orchestrated suite to avoid legacy suite conflicts/hanging tests.

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['<rootDir>/test/system/BestUseCase.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  collectCoverage: false,
  maxWorkers: 1,
  testTimeout: 10000,
  verbose: true,
};

export default config;
