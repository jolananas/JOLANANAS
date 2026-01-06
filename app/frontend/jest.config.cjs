const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/app/src/tests/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Alias TypeScript pour correspondre à tsconfig.json
    '^@/(.*)$': '<rootDir>/app/src/$1',
    '^@/components/(.*)$': '<rootDir>/app/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/app/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/app/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/app/src/types/$1',
    '^@/config/(.*)$': '<rootDir>/app/src/variables/$1',
    '^@/shared/(.*)$': '<rootDir>/../shared/$1',
  },
  testMatch: [
    '<rootDir>/app/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/app/src/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
  ],
  collectCoverageFrom: [
    'app/src/**/*.{js,jsx,ts,tsx}',
    '!app/src/**/*.d.ts',
    '!app/src/**/*.stories.{js,jsx,ts,tsx}',
    '!app/src/**/__tests__/**',
    '!app/src/**/node_modules/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

