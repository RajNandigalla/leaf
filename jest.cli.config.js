export default {
  testEnvironment: 'node',
  transform: {}, // Disable transformation for native ESM
  testMatch: ['**/scripts/leaf/__tests__/**/*.test.mjs'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'scripts/leaf/commands/**/*.mjs',
    'scripts/leaf/utils/**/*.mjs',
    '!scripts/leaf/**/__tests__/**',
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
