module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "validators/**/*.js",
    "services/**/*.js",
    "controllers/**/*.js",
    "models/**/*.js",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  testTimeout: 10000,
};
