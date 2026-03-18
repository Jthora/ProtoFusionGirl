// Jest config for ESM TypeScript support

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  clearMocks: true,
  setupFilesAfterEnv: ['./jest.setup.js'],

  // Explicit timeout — prevents silent hangs without needing --forceExit
  testTimeout: 8000,

  // Coverage enforcement — starting thresholds, ratchet up over time
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },

  // Exclude non-test support files from coverage reporting
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/universal_language/',
    '/dist/',
    '/__mocks__/',
    '\\.d\\.ts$',
    'jest\\.setup',
    '/test/fixtures/',
    '/test/utils/',
  ],

  // Exclude known-stub test files from being run until implemented
  testPathIgnorePatterns: [
    '/node_modules/',
    '/universal_language/',
    // These are scaffold stubs — excluded until implemented
    'test/world/WorldTraversalSystem\\.test\\.ts',
    'src/tests/',
    'src/mvp/',
  ],

  // Surface module aliasing issues early
  moduleNameMapper: {
    // Static assets that break ts-jest
    '\\.(png|jpg|svg|gif|mp3|ogg|wav)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
};

export default config;
