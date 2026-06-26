module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/game/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
};
