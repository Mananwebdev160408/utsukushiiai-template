/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
};
