const jestConfig = {
  testEnvironment: 'node',
  transform: {}, // Disable transformation for native ESM
  testMatch: ['**/packages/cli/__tests__/**/*.test.mjs'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/cli/commands/**/*.mjs',
    'packages/cli/utils/**/*.mjs',
    '!packages/cli/**/__tests__/**',
  ],
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  coverageDirectory: 'coverage/cli',
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};

export default jestConfig;
