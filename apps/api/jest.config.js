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
  moduleNameMapper: {
    "^@utsukushii/shared/(.*)$": "<rootDir>/../../packages/shared/$1",
    "^@utsukushii/shared$": "<rootDir>/../../packages/shared/src",
    "^@utsukushii/database/(.*)$": "<rootDir>/../../packages/database/$1",
    "^@utsukushii/database$": "<rootDir>/../../packages/database/src",
  },
};
