// Lightweight Jest config for pure game-logic tests (no React Native runtime).
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/game/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
};
