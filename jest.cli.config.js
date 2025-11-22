export default {
  testEnvironment: 'node',
  transform: {}, // Disable transformation for native ESM
  testMatch: ['**/scripts/leaf/__tests__/**/*.test.mjs'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
};
